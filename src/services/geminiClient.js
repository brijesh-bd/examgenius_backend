import { AiServiceError, GenerationError } from './questionGenerator.js';

/**
 * Gemini JSON calls shared by the AI Study Notes generators.
 *
 * Error policy:
 *  - Quota exhausted (HTTP 429 RESOURCE_EXHAUSTED): logged with the quota
 *    metric, model and retry delay, then the request fails at once — no
 *    retry and no switch to another model (the student retries later).
 *  - Transient (500/502/503/504, timeout, network): retried ONCE on the same
 *    model after a short backoff, then the next model (logged).
 *  - Model not found (404): no retry; the next model is tried.
 *  - Permanent (400 bad request, 401/403 key/permission): no retry, no
 *    fallback — the request fails immediately (retrying cannot help).
 *  - Cut-off output (finishReason MAX_TOKENS) or unreadable JSON: the result
 *    is never used; treated like a transient failure.
 * Every failure and the final outcome are logged, so a model switch is
 * never silent.
 */

const TRANSIENT = new Set([500, 502, 503, 504]);

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
          if (err.quotaExhausted) {
            // A per-MODEL limit (e.g. free-tier requests per day per model):
            // the next model has its own allowance, so try it (no retry of
            // this one). A project-wide limit: switching would only burn more.
            if (isPerModelQuota(err.quota) && model !== models.at(-1)) {
              this.log.warn?.(`[${label}] ${model} daily/model quota used up — trying the next model`);
              break;
            }
            this.log.error?.(`[${label}] Gemini quota exhausted — not retried, no model switch: ${JSON.stringify(err.quota)}`);
            throw err;
          }
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
    if (!res.ok) throw httpFailure(res.status, body, model, this.log);
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

/** A failed Gemini HTTP response → a tagged error (same policy for normal and streamed calls). */
function httpFailure(status, body, model, log) {
  const msg = `HTTP ${status} ${body?.error?.status ?? ''}: ${body?.error?.message ?? ''}`.trim();
  if (status === 404) return tag(new AiServiceError(msg, true), { modelMissing: true });
  if (status === 429) {
    const quota = quotaInfo(body, model);
    return tag(new AiServiceError(msg.split('\n')[0], true), { quotaExhausted: true, quota, retryAfterSeconds: quota.retryAfterSeconds });
  }
  if (TRANSIENT.has(status)) return tag(new AiServiceError(msg.split('\n')[0], true), { transient: true });
  // 400 / 401 / 403: configuration problem (key, permission, request).
  log.error?.(`Gemini rejected the request (${msg}) — check GEMINI_API_KEY / model / request`);
  return tag(new AiServiceError('AI service is not configured correctly.', false), { permanent: true });
}

/**
 * Streamed JSON generation (Gemini `streamGenerateContent?alt=sse`).
 * `onText(fullTextSoFar)` is called as chunks arrive. Model fallback (per-
 * model quota, overload, missing model, transient error) happens ONLY before
 * the first chunk: once output has started, a failure is final — never a
 * silent second paid generation. Resolves to { json, model, usage, ttfbMs, aiMs }.
 */
export async function streamJson(client, { models, label, systemPrompt, prompt, schema, temperature = 0.4, maxOutputTokens, validate, onText = () => {} }) {
  let lastError = null;
  const failed = [];
  for (const model of models) {
    const started = Date.now();
    let text = '';
    let usage = null;
    let finishReason = null;
    let ttfbMs = null;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), client.timeoutMs);
    try {
      let res;
      try {
        res = await client.fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
          method: 'POST',
          signal: ctl.signal,
          headers: { 'content-type': 'application/json', 'x-goog-api-key': client.apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature, ...(maxOutputTokens ? { maxOutputTokens } : {}) },
          }),
        });
      } catch (err) {
        throw tag(new AiServiceError(err.name === 'AbortError' ? `timed out after ${client.timeoutMs}ms` : 'network error', true), { transient: true });
      }
      if (!res.ok) throw httpFailure(res.status, await res.json().catch(() => ({})), model, client.log);

      // SSE: "data: {json}\n\n" events.
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        for await (const bytes of res.body) {
          // Gemini separates SSE events with CRLF ("\r\n\r\n"): normalise first.
          buffer = (buffer + decoder.decode(bytes, { stream: true })).replace(/\r\n/g, '\n');
          let cut;
          while ((cut = buffer.indexOf('\n\n')) >= 0) {
            const event = buffer.slice(0, cut);
            buffer = buffer.slice(cut + 2);
            const data = event.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('');
            if (!data) continue;
            const chunk = JSON.parse(data);
            const cand = chunk.candidates?.[0];
            const piece = (cand?.content?.parts ?? []).map((p) => p.text ?? '').join('');
            if (piece) {
              if (ttfbMs === null) ttfbMs = Date.now() - started;
              text += piece;
              onText(text);
            }
            if (cand?.finishReason) finishReason = cand.finishReason;
            if (chunk.usageMetadata) usage = chunk.usageMetadata;
          }
        }
      } catch (err) {
        // The stream broke after output started: final (no second paid call).
        throw tag(
          new GenerationError(err.name === 'AbortError' ? 'The AI took too long and the stream was stopped. Nothing was saved.' : 'The AI stream was interrupted. Nothing was saved.'),
          { interrupted: true, partial: text.length > 0 },
        );
      }
      if (finishReason === 'SAFETY') throw new GenerationError('The AI declined this request. Try another topic.');
      if (finishReason === 'MAX_TOKENS') throw new GenerationError('The AI response was cut off before it finished.');
      if (!text) throw tag(new GenerationError('The AI returned an empty response.'), { transient: true, empty: true });
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new GenerationError('The AI response could not be read.');
      }
      const value = validate ? validate(json) : json;
      if (failed.length) client.log.warn?.(`[${label}] stream result from ${model} after: ${failed.join('; ')}`);
      return { json: value, model, usage, ttfbMs, aiMs: Date.now() - started };
    } catch (err) {
      lastError = err;
      failed.push(`${model}: ${err.message}`);
      client.log.warn?.(`[${label}] ${model} stream: ${err.message}`);
      // Output already reached the student, or a content/validation problem: stop.
      if (text.length > 0 || err instanceof GenerationError && !err.empty) throw err;
      if (err.permanent) throw err;
      if (err.quotaExhausted && !(isPerModelQuota(err.quota) && model !== models.at(-1))) throw err;
      // Nothing was produced: the next model may answer (one attempt each, no blind retries).
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof AiServiceError || lastError instanceof GenerationError
    ? lastError
    : new AiServiceError('AI is busy right now. Please try again shortly.', true);
}

/** `RetryInfo.retryDelay` ("72364s") from a Gemini error body, in seconds. */
export function retryDelaySeconds(body) {
  const info = (body?.error?.details ?? []).find((d) => String(d?.['@type'] ?? '').endsWith('RetryInfo'));
  const m = /^([\d.]+)s$/.exec(info?.retryDelay ?? '');
  return m ? Number(m[1]) : null;
}

/**
 * What a 429 says: HTTP status, Gemini error status, quota metric/id/limit
 * (QuotaFailure), model and the suggested wait (RetryInfo).
 */
export function quotaInfo(body, model) {
  const details = body?.error?.details ?? [];
  const failure = details.find((d) => String(d?.['@type'] ?? '').endsWith('QuotaFailure'));
  return {
    httpStatus: 429,
    geminiStatus: body?.error?.status ?? null,
    model,
    violations: (failure?.violations ?? []).map((v) => ({
      metric: v.quotaMetric ?? null,
      id: v.quotaId ?? null,
      limit: v.quotaValue ?? null,
      dimensions: v.quotaDimensions ?? null,
    })),
    retryAfterSeconds: retryDelaySeconds(body),
  };
}

/** True when every violated quota is scoped to one model (another model may still have quota). */
export function isPerModelQuota(quota) {
  const v = quota?.violations ?? [];
  return v.length > 0 && v.every((x) => x.dimensions?.model || /PerModel/i.test(x.id ?? ''));
}

function tag(err, flags) {
  return Object.assign(err, flags);
}
