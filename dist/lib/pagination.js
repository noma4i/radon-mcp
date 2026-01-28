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
 * Pagination by offset/limit (lines)
 */
export function paginateLines(text, offset = 0, limit = 200) {
  const lines = text.split('\n');
  const total = lines.length;
  const slice = lines.slice(offset, offset + limit);

  return {
    text: slice.join('\n'),
    offset,
    limit,
    total,
    hasMore: offset + limit < total,
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
