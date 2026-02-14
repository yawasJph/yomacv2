export function timeAgoTiny(timestamp) {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = Math.floor((now - past) / 1000);

  if (diff < 5) return "ahora";
  if (diff < 60) return `${diff}s`;

  const min = Math.floor(diff / 60);
  if (min < 60) return `${min}m`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;

  const week = Math.floor(day / 7);
  if (week < 5) return `${week}sem`;

  const month = Math.floor(day / 30);
  if (month < 12) return `${month}mes`;

  const year = Math.floor(day / 365);
  return `${year}a`;
}
