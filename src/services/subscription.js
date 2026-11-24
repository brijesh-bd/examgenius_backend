/**
 * Free vs Pro: entitlements and daily usage limits.
 *
 * A user's plan lives on the user document:
 *   plan: { tier: 'pro', source: 'trial' | 'manual' | 'purchase', expiresAt: Date }
 *   trialUsed: true
 * No plan (or an expired one) = Free, immediately.
 *
 * Daily counters live in `usage` with _id "<userId>:<YYYY-MM-DD>", where the
 * date is the student's LOCAL date (user.tzOffsetMinutes, default India
 * +330), so limits reset at the student's midnight.
 *   sets:      practice sets today (bank + AI)
 *   aiSets:    AI-generated sets today
 *   questions: questions served today (Pro fair use)
 */
export class LimitError extends Error {
  /** @param {'DAILY_SETS'|'DAILY_AI_SETS'|'AI_NOT_IN_PLAN'|'DAILY_QUESTIONS'|'SET_SIZE'|'SAVED_LIMIT'} code */
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = 403;
  }
}

/** India Standard Time, the default when the app has not sent a timezone. */
export const DEFAULT_TZ_OFFSET_MIN = 330;
/** A timezone change is accepted at most once per this period (anti-abuse). */
export const TZ_CHANGE_COOLDOWN_MS = 24 * 3600_000;

/** YYYY-MM-DD at UTC offset [offsetMin] (minutes east of UTC). */
export function localDate(now = new Date(), offsetMin = DEFAULT_TZ_OFFSET_MIN) {
  return new Date(now.getTime() + offsetMin * 60_000).toISOString().slice(0, 10);
}

/** Next local midnight at [offsetMin], as a Date. */
export function nextLocalMidnight(now = new Date(), offsetMin = DEFAULT_TZ_OFFSET_MIN) {
  const local = new Date(now.getTime() + offsetMin * 60_000);
  local.setUTCHours(24, 0, 0, 0);
  return new Date(local.getTime() - offsetMin * 60_000);
}

/** Kept for existing callers/tests: the India-time versions. */
export const istDate = (now = new Date()) => localDate(now, DEFAULT_TZ_OFFSET_MIN);
export const nextIstMidnight = (now = new Date()) => nextLocalMidnight(now, DEFAULT_TZ_OFFSET_MIN);

/** Valid UTC offsets: −12:00 … +14:00. */
export const isValidTzOffset = (m) => Number.isInteger(m) && m >= -720 && m <= 840;

export class SubscriptionService {
  /**
   * @param {{ users: import('mongodb').Collection, usage: import('mongodb').Collection }} cols
   * @param {object} plansConfig  config.plans
   */
  constructor({ users, usage }, plansConfig, clock = () => new Date()) {
    this.users = users;
    this.usage = usage;
    this.cfg = plansConfig;
    this.now = clock;
  }

  isPro(user) {
    const exp = user?.plan?.expiresAt;
    return user?.plan?.tier === 'pro' && exp != null && new Date(exp) > this.now();
  }

  limitsFor(user) {
    return this.isPro(user) ? this.cfg.pro : this.cfg.free;
  }

  tzOffset(user) {
    return isValidTzOffset(user?.tzOffsetMinutes) ? user.tzOffsetMinutes : DEFAULT_TZ_OFFSET_MIN;
  }

  #today(user) {
    return localDate(this.now(), this.tzOffset(user));
  }

  #usageId(user) {
    return `${user._id}:${this.#today(user)}`;
  }

  resetsAt(user) {
    return nextLocalMidnight(this.now(), this.tzOffset(user)).toISOString();
  }

  async usageToday(user) {
    const doc = await this.usage.findOne({ _id: this.#usageId(user) });
    return { sets: doc?.sets ?? 0, aiSets: doc?.aiSets ?? 0, questions: doc?.questions ?? 0 };
  }

  /**
   * Stores the device's UTC offset. A change is accepted at most once per
   * 24 h, so switching timezones cannot be used to reset the daily limits.
   * Returns the (possibly unchanged) user.
   */
  async setTimezone(user, offsetMin) {
    if (!isValidTzOffset(offsetMin)) {
      throw Object.assign(new Error('Invalid timezone offset'), { status: 400 });
    }
    if (user.tzOffsetMinutes === offsetMin) return user;
    const last = user.tzUpdatedAt ? new Date(user.tzUpdatedAt).getTime() : 0;
    if (user.tzOffsetMinutes != null && this.now().getTime() - last < TZ_CHANGE_COOLDOWN_MS) return user;
    return (
      (await this.users.findOneAndUpdate(
        { _id: user._id },
        { $set: { tzOffsetMinutes: offsetMin, tzUpdatedAt: this.now() } },
        { returnDocument: 'after' },
      )) ?? user
    );
  }

  /**
   * Checks the request against the plan and RESERVES today's quota in one
   * atomic update (so double taps cannot exceed it). Call [release] if the
   * set then fails.
   *
   * @param {{ count: number, source: 'bank'|'ai' }} req
   */
  /** Plan rules that need no usage data (checked before anything else). */
  assertAllowed(user, { count, source }) {
    const limits = this.limitsFor(user);
    if (source === 'ai' && limits.aiSetsPerDay === 0) {
      throw new LimitError('AI_NOT_IN_PLAN', 'AI-generated questions are not included in your plan');
    }
    if (count > limits.maxQuestionsPerSet) {
      throw new LimitError('SET_SIZE', `Your plan allows up to ${limits.maxQuestionsPerSet} questions per set`, {
        max: limits.maxQuestionsPerSet,
      });
    }
  }

  async reserveGeneration(user, { count, source }) {
    this.assertAllowed(user, { count, source });
    const limits = this.limitsFor(user);
    const ai = source === 'ai';

    const _id = this.#usageId(user);
    const condition = {};
    if (limits.setsPerDay != null) condition.sets = { $lt: limits.setsPerDay };
    if (limits.questionsPerDay != null) condition.questions = { $lte: limits.questionsPerDay - count };
    if (ai && limits.aiSetsPerDay != null) condition.aiSets = { $lt: limits.aiSetsPerDay };
    try {
      const updated = await this.usage.findOneAndUpdate(
        { _id, ...condition },
        {
          $inc: { sets: 1, questions: count, aiSets: ai ? 1 : 0 },
          $setOnInsert: { userId: user._id, date: this.#today(user) },
        },
        { upsert: true, returnDocument: 'after' },
      );
      if (updated) return { _id, count, ai };
    } catch (err) {
      // Upsert collided with an existing doc that failed the condition = limit hit.
      if (err?.code !== 11000) throw err;
    }

    // Which limit was hit (most specific first).
    const usage = await this.usageToday(user);
    const resetsAt = this.resetsAt(user);
    if (limits.setsPerDay != null && usage.sets >= limits.setsPerDay) {
      throw new LimitError('DAILY_SETS', `Your plan allows ${limits.setsPerDay} practice sets per day`, {
        max: limits.setsPerDay,
        resetsAt,
      });
    }
    if (ai && limits.aiSetsPerDay != null && usage.aiSets >= limits.aiSetsPerDay) {
      throw new LimitError('DAILY_AI_SETS', `Your plan allows ${limits.aiSetsPerDay} AI-generated set(s) per day`, {
        max: limits.aiSetsPerDay,
        resetsAt,
      });
    }
    throw new LimitError('DAILY_QUESTIONS', `Daily fair-use limit of ${limits.questionsPerDay} questions reached`, {
      max: limits.questionsPerDay,
      resetsAt,
    });
  }

  /** Gives back a reservation (set failed) or trims it (fewer questions). */
  async release(reservation, { unusedQuestions = reservation.count, refundSet = true } = {}) {
    await this.usage.updateOne(
      { _id: reservation._id },
      {
        $inc: {
          sets: refundSet ? -1 : 0,
          aiSets: refundSet && reservation.ai ? -1 : 0,
          questions: -unusedQuestions,
        },
      },
    );
  }

  /** Free users may keep only [maxSaved] saved sets. */
  async assertCanSave(user, savedCount) {
    const limits = this.limitsFor(user);
    if (limits.maxSaved != null && savedCount >= limits.maxSaved) {
      throw new LimitError('SAVED_LIMIT', `Free plan can keep ${limits.maxSaved} saved practice sets`, {
        max: limits.maxSaved,
      });
    }
  }

  /** One free trial per account. */
  async startTrial(user) {
    if (user.trialUsed) throw Object.assign(new Error('Free trial already used'), { status: 409 });
    if (this.isPro(user)) throw Object.assign(new Error('You already have Pro'), { status: 409 });
    const expiresAt = new Date(this.now().getTime() + this.cfg.trialDays * 86_400_000);
    return this.users.findOneAndUpdate(
      { _id: user._id, trialUsed: { $ne: true } },
      { $set: { plan: { tier: 'pro', source: 'trial', expiresAt }, trialUsed: true } },
      { returnDocument: 'after' },
    );
  }

  /** Admin/payment hook: extend Pro by [days] from max(now, current expiry). */
  async grantPro(userId, days, source = 'manual') {
    const user = await this.users.findOne({ _id: userId });
    if (!user) return null;
    const from = this.isPro(user) ? new Date(user.plan.expiresAt) : this.now();
    const expiresAt = new Date(from.getTime() + days * 86_400_000);
    return this.users.findOneAndUpdate(
      { _id: userId },
      { $set: { plan: { tier: 'pro', source, expiresAt } } },
      { returnDocument: 'after' },
    );
  }

  /** What the app shows on "My Plan", Plans and Create Practice. */
  async status(user) {
    const pro = this.isPro(user);
    const usage = await this.usageToday(user);
    const limits = this.limitsFor(user);
    const left = (max, used) => (max == null ? null : Math.max(0, max - used));
    return {
      tier: pro ? 'pro' : 'free',
      source: pro ? (user.plan.source ?? 'manual') : null,
      expiresAt: pro ? new Date(user.plan.expiresAt).toISOString() : null,
      trialAvailable: !pro && !user.trialUsed,
      trialDays: this.cfg.trialDays,
      limits: {
        setsPerDay: limits.setsPerDay ?? null,
        aiSetsPerDay: limits.aiSetsPerDay ?? null,
        questionsPerDay: limits.questionsPerDay ?? null,
        maxQuestionsPerSet: limits.maxQuestionsPerSet,
        maxSaved: limits.maxSaved ?? null,
        customCount: Boolean(limits.customCount),
        // Older app builds read this as "may use AI questions".
        freshAi: limits.aiSetsPerDay !== 0,
      },
      usageToday: usage,
      remainingToday: {
        sets: left(limits.setsPerDay, usage.sets),
        aiSets: left(limits.aiSetsPerDay, usage.aiSets),
        questions: left(limits.questionsPerDay, usage.questions),
      },
      tzOffsetMinutes: this.tzOffset(user),
      resetsAt: this.resetsAt(user),
      offers: this.cfg.offers,
    };
  }
}
