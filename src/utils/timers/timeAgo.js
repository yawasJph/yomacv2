const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const DIVISIONS = [
  { amount: 60, name: "second" },
  { amount: 60, name: "minute" },
  { amount: 24, name: "hour" },
  { amount: 7, name: "day" },
  { amount: 4.34524, name: "week" },
  { amount: 12, name: "month" },
  { amount: Number.POSITIVE_INFINITY, name: "year" }
];

/* ===============================
   CORE ENGINE (ULTRA OPTIMIZADO)
================================ */
export function formatTimeAgo(timestamp) {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  let diff = (past - now) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(diff) < division.amount) {
      return rtf.format(Math.round(diff), division.name);
    }
    diff /= division.amount;
  }
}

/* ===============================
   VERSION CORTA (tipo Twitter)
================================ */
export function formatTimeTiny(timestamp) {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = Math.floor((now - past) / 1000);

  if (diff < 10) return "ahora";
  if (diff < 60) return `${diff}s`;

  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;

  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;

  const w = Math.floor(d / 7);
  if (w < 5) return `${w}sem`;

  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mes`;

  const y = Math.floor(d / 365);
  return `${y}a`;
}
