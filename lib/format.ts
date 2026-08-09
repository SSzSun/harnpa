/**
 * Money with grouped thousands and exactly two decimals. Pinned to en-US
 * digits so server and client markup always match, regardless of the request
 * locale or the viewer's machine settings.
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Compact format for large amounts: 100k, 1.5M
 * Used in stat cards where space is limited.
 */
export function formatMoneyCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 100_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return formatMoney(amount);
}

const pad = (n: number) => n.toString().padStart(2, '0');

/** dd/mm/yy — built by hand so it never depends on the host locale. */
export function formatShortDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear() % 100)}`;
}

/** dd/mm/yy HH:mm */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${formatShortDate(timestamp)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * "5 minutes ago" for anything inside the last week, absolute date beyond that.
 * Only call this from an effect or an event handler — the output depends on the
 * current clock, so rendering it during SSR would produce a hydration mismatch.
 */
export function formatRelativeTime(timestamp: number, locale: string): string {
  const diff = Date.now() - timestamp;

  if (diff < MINUTE) {
    // Intl renders 0 as "this minute", which reads oddly for "just saved".
    return locale === 'th' ? 'เมื่อสักครู่' : 'just now';
  }
  if (diff >= 7 * DAY) {
    return formatDateTime(timestamp);
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (diff < HOUR) return rtf.format(-Math.floor(diff / MINUTE), 'minute');
  if (diff < DAY) return rtf.format(-Math.floor(diff / HOUR), 'hour');
  return rtf.format(-Math.floor(diff / DAY), 'day');
}
