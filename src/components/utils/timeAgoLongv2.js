const rtf = new Intl.RelativeTimeFormat("es", {
  numeric: "auto",
});

export function timeAgoLong(timestamp) {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = (past - now) / 1000; // negativo = pasado

  const units = [
    { limit: 60, name: "second", div: 1 },
    { limit: 3600, name: "minute", div: 60 },
    { limit: 86400, name: "hour", div: 3600 },
    { limit: 604800, name: "day", div: 86400 },
    { limit: 2629800, name: "week", div: 604800 },
    { limit: 31557600, name: "month", div: 2629800 },
    { limit: Infinity, name: "year", div: 31557600 },
  ];

  for (const u of units) {
    if (Math.abs(diff) < u.limit) {
      return rtf.format(Math.round(diff / u.div), u.name);
    }
  }
}
