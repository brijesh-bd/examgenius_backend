/**
 * Best-effort parse of an INCOMPLETE JSON document (a streamed AI answer):
 * closes the open string / arrays / objects and drops a dangling key or
 * separator, so everything written so far can be shown progressively.
 * Returns null when nothing usable can be recovered yet. Never used to
 * SAVE notes: saving always waits for the complete, validated response.
 */
export function parsePartialJson(text) {
  const src = String(text ?? '');
  // Walk once: remember open containers and whether we are inside a string.
  const stack = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{' || ch === '[') stack.push(ch);
    else if (ch === '}' || ch === ']') stack.pop();
  }
  let body = src;
  if (inString) {
    // A cut escape ("\" or "\u12") would break the string: drop it.
    body = body.replace(/\\(u[0-9a-fA-F]{0,3})?$/, '');
    body += '"';
  }
  const closers = stack.map((c) => (c === '{' ? '}' : ']')).reverse().join('');
  // Try progressively shorter tails: a dangling `"key"`, `"key":`, `,` or a
  // half-written literal (tru / 12.) cannot be closed, so it is cut off.
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      return JSON.parse(body + closers);
    } catch {
      const trimmed = body
        .replace(/,\s*$/, '')
        .replace(/,?\s*"(?:[^"\\]|\\.)*"\s*:?\s*$/, '')
        .replace(/:\s*[^,{}[\]"]*$/, '')
        .replace(/,?\s*[-\d.eE+]+$|,?\s*(?:t|tr|tru|f|fa|fal|fals|n|nu|nul)$/, '');
      if (trimmed === body) break;
      body = trimmed;
    }
  }
  return null;
}
