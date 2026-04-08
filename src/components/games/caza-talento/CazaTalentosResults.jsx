import { Trophy } from "lucide-react";

const getRank = (points) => {
  if (points >= 2500)
    return {
      label: "ZAFIRO",
      color: "text-indigo-400",
      gradient: "from-indigo-500 to-cyan-400",
      bg: "bg-indigo-500/10",
      icon: "💎",
    };
  if (points >= 2000)
    return {
      label: "RUBÍ",
      color: "text-red-400",
      gradient: "from-red-500 to-pink-400",
      bg: "bg-red-500/10",
      icon: "🌹",
    };
  if (points >= 1500)
    return {
      label: "DIAMANTE",
      color: "text-cyan-400",
      gradient: "from-cyan-500 to-sky-400",
      bg: "bg-cyan-500/10",
      icon: "✨",
    };
  if (points >= 1000)
    return {
      label: "ORO",
      color: "text-amber-400",
      gradient: "from-amber-500 to-yellow-400",
      bg: "bg-amber-500/10",
      icon: "👑",
    };
  if (points >= 500)
    return {
      label: "PLATA",
      color: "text-slate-400",
      gradient: "from-slate-400 to-gray-300",
      bg: "bg-slate-500/10",
      icon: "🥈",
    };
  return {
    label: "BRONCE",
    color: "text-orange-600",
    gradient: "from-orange-500 to-red-400",
    bg: "bg-orange-500/10",
    icon: "🥉",
  };
};

const CazaTalentosResults = ({ score, onReset, onExit, onShare }) => {
  const rank = getRank(score);

  return (
    <div className="w-full bg-neutral-950/98 backdrop-blur-2xl">
      {/* HERO */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className={`p-6 rounded-3xl bg-linear-to-br ${rank.gradient}`}>
          <Trophy className="text-white w-12 h-12" />
        </div>

        <span
          className={`mt-3 text-xs font-black tracking-widest ${rank.color}`}
        >
          RANGO {rank.label}
        </span>

        <h2 className="text-5xl font-black mt-2 dark:text-white">{score}</h2>
        <p className="text-xs uppercase text-gray-400">Puntos Totales</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Stat label="Rango" value={rank.icon} />
        <Stat label="Bonus" value={`+${Math.floor(score / 100)}`} />
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onReset}
          className="py-4 bg-emerald-500 text-white rounded-2xl font-black"
        >
          ⚡ Reintentar
        </button>

        <button
          onClick={onExit}
          className="py-4 bg-gray-100 dark:bg-neutral-900 rounded-2xl font-black"
        >
          Volver
        </button>

        <button
          onClick={onShare}
          className="
            py-4 rounded-2xl font-black text-white
            bg-linear-to-r from-emerald-500 to-teal-400
          "
        >
          🚀 Compartir resultado
        </button>
      </div>
    </div>
  );
};

export default CazaTalentosResults;

const Stat = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-2">
    <div className="text-[10px] uppercase text-gray-400 font-bold">{label}</div>
    <div className="font-black text-sm dark:text-white">{value}</div>
  </div>
);