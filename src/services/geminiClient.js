import { AiServiceError, GenerationError } from './questionGenerator.js';

/**
 * Gemini JSON calls shared by the AI Study Notes generators.
 *
 * Error policy:
 *  - Transient (429 rate limit, 500/502/503/504, timeout, network): retried
 *    ONCE on the same model after a short backoff, then the next model.
 *  - Model not found (404): no retry; the next model is tried.
 *  - Permanent (400 bad request, 401/403 key/permission): no retry, no
 *    fallback — the request fails immediately (retrying cannot help).
 *  - Cut-off output (finishReason MAX_TOKENS) or unreadable JSON: the result
 *    is never used; treated like a transient failure.
 * Every failure and the final outcome are logged, so a model switch is
 * never silent.
 */

const TRANSIENT = new Set([429, 500, 502, 503, 504]);

/** Flash-Lite is not allowed for study notes (too shallow). */
export const isLiteModel = (m) => /lite/i.test(m);

export class GeminiJsonClient {
  constructor({ apiKey, timeoutMs, fetchImpl = fetch, log = console, backoffMs = 2500, sleep }) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
    this.fetch = fetchImpl;
    this.log = log;
    this.backoffMs = backoffMs;
    this.sleep = sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  }

  /**
   * Tries each model in order (one retry for transient errors per model).
   * Resolves to { json, model, usage, fallbackFrom } or throws the last error.
   */
  async generate({ models, label, systemPrompt, prompt, schema, temperature = 0.4, maxOutputTokens, validate }) {
    let lastError = null;
    const failed = [];
    for (const model of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const { json, usage } = await this.#call({ model, systemPrompt, prompt, schema, temperature, maxOutputTokens });
          const value = validate ? validate(json) : json;
          const fellBack = model !== models[0];
          if (failed.length) {
            this.log.warn?.(
              `[${label}] ${fellBack ? `fallback result: ${model} (instead of ${models[0]})` : `${model} retry`} succeeded after: ${failed.join('; ')}`,
            );
          }
          return { json: value, model, usage, fallbackFrom: fellBack ? models[0] : null };
        } catch (err) {
          lastError = err;
          const reason = `${model} attempt ${attempt}: ${err.message}`;
          failed.push(reason);
          this.log.warn?.(`[${label}] ${reason}`);
          if (err.permanent) throw err; // bad key / bad request: stop now
          if (err.modelMissing) break; // try the next model, no retry
          if (attempt === 1 && err.transient) {
            await this.sleep(this.backoffMs + Math.floor(Math.random() * 1000));
            continue;
          }
          break;
        }
      }
    }
    this.log.error?.(`[${label}] all models failed: ${failed.join('; ')}`);
    throw lastError instanceof AiServiceError || lastError instanceof GenerationError
      ? lastError
      : new AiServiceError('AI is busy right now. Please try again shortly.', true);
  }

  async #call({ model, systemPrompt, prompt, schema, temperature, maxOutputTokens }) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), this.timeoutMs);
    let res;
    try {
      res = await this.fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        signal: ctl.signal,
        headers: { 'content-type': 'application/json', 'x-goog-api-key': this.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature,
            ...(maxOutputTokens ? { maxOutputTokens } : {}),
          },
        }),
      });
    } catch (err) {
      throw tag(new AiServiceError(err.name === 'AbortError' ? `timed out after ${this.timeoutMs}ms` : 'network error', true), { transient: true });
    } finally {
      clearTimeout(timer);
    }

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = `HTTP ${res.status} ${body?.error?.status ?? ''}: ${body?.error?.message ?? ''}`.trim();
      if (res.status === 404) throw tag(new AiServiceError(msg, true), { modelMissing: true });
      if (TRANSIENT.has(res.status)) {
        // A quota that resets in minutes/hours (e.g. the Free Tier daily
        // limit) is not worth a quick retry: go straight to the next model.
        const wait = retryDelaySeconds(body);
        if (wait !== null && wait > MAX_RETRY_WAIT_S) {
          throw tag(new AiServiceError(msg.split('\n')[0], true), { quotaExhausted: true, retryAfterSeconds: wait });
        }
        throw tag(new AiServiceError(msg.split('\n')[0], true), { transient: true });
      }
      // 400 / 401 / 403: configuration problem (key, permission, request).
      this.log.error?.(`Gemini rejected the request (${msg}) — check GEMINI_API_KEY / model / request`);
      throw tag(new AiServiceError('AI service is not configured correctly.', false), { permanent: true });
    }
    const candidate = body?.candidates?.[0];
    if (!candidate || candidate.finishReason === 'SAFETY') {
      throw new GenerationError('The AI declined this request. Try another topic.');
    }
    if (candidate.finishReason === 'MAX_TOKENS') {
      throw tag(new GenerationError('The AI response was cut off before it finished.'), { transient: true });
    }
    const text = (candidate.content?.parts ?? []).map((p) => p.text ?? '').join('');
    try {
      return { json: JSON.parse(text), usage: body.usageMetadata ?? null };
    } catch {
      throw tag(new GenerationError('The AI response could not be read.'), { transient: true });
    }
  }
}

/** Retry once only when Google asks to wait at most this long. */
const MAX_RETRY_WAIT_S = 30;

/** `RetryInfo.retryDelay` ("72364s") from a Gemini error body, in seconds. */
export function retryDelaySeconds(body) {
  const info = (body?.error?.details ?? []).find((d) => String(d?.['@type'] ?? '').endsWith('RetryInfo'));
  const m = /^([\d.]+)s$/.exec(info?.retryDelay ?? '');
  return m ? Number(m[1]) : null;
}

function tag(err, flags) {
  return Object.assign(err, flags);
}
