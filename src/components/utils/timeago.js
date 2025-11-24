export function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);
  
    const intervals = {
      año: 31536000,
      mes: 2592000,
      semana: 604800,
      dia: 86400,
      hora: 3600,
      minuto: 60,
    };
  
    if (seconds < 60) return "justo ahora";
  
    for (const [unit, value] of Object.entries(intervals)) {
      const amount = Math.floor(seconds / value);
      if (amount >= 1) {
        if (unit === "day" && amount === 1) return "ayer";
        return `hace ${amount} ${unit}${amount > 1 ? "s" : ""}`;
      }
    }
  }
  