/**
 * Coarse "X ago" formatter for the history sidebar. Not localized, not
 * pluralized cleverly — fits the screening-tool vocabulary. Times in the
 * future or in the very recent past read as "just now".
 */
export function relativeTime(then: number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
