/**
 * Free vs Pro: entitlements and daily usage limits.
 *
 * A user's plan lives on the user document:
 *   plan: { tier: 'pro', source: 'trial' | 'manual' | 'purchase', expiresAt: Date }
 *   trialUsed: true
 * No plan (or an expired one) = Free.
 *
 * Daily counters live in `usage` with _id "<userId>:<YYYY-MM-DD>" in India time,
 * so limits reset at midnight IST.
 */
export class LimitError extends Error {
  /** @param {'DAILY_SETS'|'DAILY_QUESTIONS'|'SET_SIZE'|'SAVED_LIMIT'|'FRESH_AI_PRO'} code */
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = 403;
  }
}

/** YYYY-MM-DD in Asia/Kolkata (UTC+5:30, no DST). */
export function istDate(now = new Date()) {
  return new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

/** Next midnight IST, as a Date (when daily limits reset). */
export function nextIstMidnight(now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 3600_000);
  ist.setUTCHours(24, 0, 0, 0);
  return new Date(ist.getTime() - 5.5 * 3600_000);
}

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

  #usageId(userId) {
    return `${userId}:${istDate(this.now())}`;
  }

  async usageToday(userId) {
    const doc = await this.usage.findOne({ _id: this.#usageId(userId) });
    return { sets: doc?.sets ?? 0, questions: doc?.questions ?? 0 };
  }

  /**
   * Checks the request against the plan and RESERVES today's quota
   * atomically (so double taps cannot exceed it). Call [release] if the
   * generation then fails.
   */
  async reserveGeneration(user, { count, fresh }) {
    const pro = this.isPro(user);
    const limits = this.limitsFor(user);
    if (fresh && !limits.freshAi) {
      throw new LimitError('FRESH_AI_PRO', 'Fresh AI questions are a Pro feature');
    }
    if (count > limits.maxQuestionsPerSet) {
      throw new LimitError('SET_SIZE', `Your plan allows up to ${limits.maxQuestionsPerSet} questions per set`, {
        max: limits.maxQuestionsPerSet,
      });
    }

    const _id = this.#usageId(user._id);
    const condition = pro
      ? { questions: { $lte: limits.questionsPerDay - count } }
      : { sets: { $lt: limits.setsPerDay } };
    try {
      const updated = await this.usage.findOneAndUpdate(
        { _id, ...condition },
        {
          $inc: { sets: 1, questions: count },
          $setOnInsert: { userId: user._id, date: istDate(this.now()) },
        },
        { upsert: true, returnDocument: 'after' },
      );
      if (updated) return { _id, count };
    } catch (err) {
      // Upsert collided with an existing doc that failed the condition = limit hit.
      if (err?.code !== 11000) throw err;
    }
    const resetsAt = nextIstMidnight(this.now()).toISOString();
    if (pro) {
      throw new LimitError('DAILY_QUESTIONS', `Daily fair-use limit of ${limits.questionsPerDay} questions reached`, {
        max: limits.questionsPerDay,
        resetsAt,
      });
    }
    throw new LimitError('DAILY_SETS', `Free plan allows ${limits.setsPerDay} practice sets per day`, {
      max: limits.setsPerDay,
      resetsAt,
    });
  }

  /** Gives back a reservation (generation failed) or trims it (fewer questions). */
  async release(reservation, { unusedQuestions = reservation.count, refundSet = true } = {}) {
    await this.usage.updateOne(
      { _id: reservation._id },
      { $inc: { sets: refundSet ? -1 : 0, questions: -unusedQuestions } },
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

  /** What the app shows on "My Plan" / Plans screen. */
  async status(user) {
    const pro = this.isPro(user);
    const usage = await this.usageToday(user._id);
    const limits = this.limitsFor(user);
    return {
      tier: pro ? 'pro' : 'free',
      source: pro ? (user.plan.source ?? 'manual') : null,
      expiresAt: pro ? new Date(user.plan.expiresAt).toISOString() : null,
      trialAvailable: !pro && !user.trialUsed,
      trialDays: this.cfg.trialDays,
      limits: {
        setsPerDay: limits.setsPerDay ?? null,
        questionsPerDay: limits.questionsPerDay ?? null,
        maxQuestionsPerSet: limits.maxQuestionsPerSet,
        maxSaved: limits.maxSaved ?? null,
        freshAi: limits.freshAi,
      },
      usageToday: usage,
      resetsAt: nextIstMidnight(this.now()).toISOString(),
      offers: this.cfg.offers,
    };
  }
}
