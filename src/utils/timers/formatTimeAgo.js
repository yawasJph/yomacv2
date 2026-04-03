export function formatTimeAgo(timestamp, now = Date.now()) {
  const diff = (now - new Date(timestamp)) / 1000;

  if (diff < 60) return "ahora";
  const minutes = diff / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h`;

  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}d`;

  const weeks = days / 7;
  if (weeks < 4) return `${Math.floor(weeks)}sem`;

  const months = days / 30;
  if (months < 12) return `${Math.floor(months)}m`;

  const years = days / 365;
  return `${Math.floor(years)}y`;
}