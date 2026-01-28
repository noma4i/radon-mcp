export const KEEP_FIRST_N = 50;
export const KEEP_LAST_N = 150;
export const MAX_LINES = KEEP_FIRST_N + KEEP_LAST_N;

/**
 * Two-tier truncation (first N + last M lines)
 */
export function truncateLines(text, firstN = KEEP_FIRST_N, lastN = KEEP_LAST_N) {
  const lines = text.split('\n');
  if (lines.length <= firstN + lastN) return text;

  const skipped = lines.length - firstN - lastN;
  const first = lines.slice(0, firstN);
  const last = lines.slice(-lastN);

  return [
    ...first,
    `\n[SKIPPED ${skipped} LINES]\n`,
    ...last,
  ].join('\n');
}

/**
 * Get last N lines from text
 */
export function lastNLines(text, n = 100) {
  const lines = text.split('\n');
  if (lines.length <= n) return text;
  return lines.slice(-n).join('\n');
}

/**
 * Truncate with summary header
 */
export function truncateLinesWithSummary(text, firstN = KEEP_FIRST_N, lastN = KEEP_LAST_N) {
  const lines = text.split('\n');
  const total = lines.length;

  if (total <= firstN + lastN) {
    return { text, summary: `${total} lines` };
  }

  const skipped = total - firstN - lastN;
  const first = lines.slice(0, firstN);
  const last = lines.slice(-lastN);

  const output = [
    ...first,
    `\n--- SKIPPED ${skipped} LINES ---\n`,
    ...last,
  ].join('\n');

  return {
    text: output,
    summary: `showing ${firstN} first + ${lastN} last of ${total} lines, skipped ${skipped}`,
  };
}

/**
 * Filter lines containing pattern
 */
export function filterLines(text, pattern, caseSensitive = false) {
  if (!pattern) return { text, matched: text.split('\n').length, total: text.split('\n').length };

  const lines = text.split('\n');
  const regex = new RegExp(pattern, caseSensitive ? '' : 'i');
  const filtered = lines.filter(line => regex.test(line));

  return {
    text: filtered.join('\n'),
    matched: filtered.length,
    total: lines.length,
  };
}

/**
 * Character limit with truncation marker
 */
export function truncateChars(text, maxChars = 50000) {
  if (text.length <= maxChars) return text;

  const half = Math.floor(maxChars / 2);
  const skipped = text.length - maxChars;

  return text.slice(0, half) + `\n\n[SKIPPED ${skipped} CHARS]\n\n` + text.slice(-half);
}
