export function timeAgoLong(timestamp) {
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diffSec = Math.floor((past - now) / 1000); // Corregido: now - past

  const divisions = [
    { amount: 60, name: "second" },
    { amount: 60, name: "minute" },
    { amount: 24, name: "hour" },
    { amount: 7, name: "day" },
    { amount: 4.34524, name: "week" },
    { amount: 12, name: "month" },
    { amount: Number.POSITIVE_INFINITY, name: "year" }
  ];

  let unit = "second";
  let value = diffSec;

  for (const division of divisions) {
    if (Math.abs(value) < division.amount) {
      unit = division.name;
      break;
    }
    value = value / division.amount;
  }

  return rtf.format(Math.round(value), unit);
}