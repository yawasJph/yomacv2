import { motion } from "framer-motion";
import { Trophy, Clock, Hash, Star, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* 🏆 Ranking visual */
const getRank = ({ score, game_id }) => {
  if (game_id === "memory") {
    if (score >= 800)
      return {
        label: "ORO",
        gradient: "from-amber-500 to-yellow-400",
        glow: "from-amber-500/30 to-yellow-400/30",
      };
    if (score >= 700)
      return {
        label: "PLATA",
        gradient: "from-slate-400 to-gray-300",
        glow: "from-slate-400/30 to-gray-300/30",
      };
    return {
      label: "BRONCE",
      gradient: "from-orange-500 to-red-400",
      glow: "from-orange-500/30 to-red-400/30",
    };
  } else if (game_id === "trivia") {
    if (score >= 4000)
      return {
        label: "ZAFIRO",
        text: "text-indigo-400",
        gradient: "from-indigo-500 to-cyan-400",
        glow: "from-indigo-500/40 to-cyan-400/40",
        button: "bg-indigo-500 shadow-indigo-500/30",
        icon: "text-indigo-500",
      };
    if (score >= 3000)
      return {
        label: "RUBÍ",
        text: "text-red-400",
        gradient: "from-red-500 to-pink-400",
        glow: "from-red-500/40 to-pink-400/40",
        button: "bg-red-500 shadow-red-500/30",
        icon: "text-red-500",
      };
    if (score >= 2000)
      return {
        label: "DIAMANTE",
        text: "text-cyan-400",
        gradient: "from-cyan-500 to-sky-400",
        glow: "from-cyan-500/40 to-sky-400/40",
        button: "bg-cyan-500 shadow-cyan-500/30",
        icon: "text-cyan-500",
      };
    if (score >= 1500)
      return {
        label: "ORO",
        text: "text-amber-400",
        gradient: "from-amber-500 to-yellow-400",
        glow: "from-amber-500/40 to-yellow-400/40",
        button: "bg-amber-500 shadow-amber-500/30",
        icon: "text-amber-500",
      };
    if (score >= 1000)
      return {
        label: "PLATA",
        text: "text-slate-400",
        gradient: "from-slate-400 to-gray-300",
        glow: "from-slate-400/40 to-gray-300/40",
        button: "bg-slate-500 shadow-slate-500/30",
        icon: "text-slate-500",
      };
    return {
      label: "BRONCE",
      text: "text-orange-500",
      gradient: "from-orange-500 to-red-400",
      glow: "from-orange-500/40 to-red-400/40",
      button: "bg-orange-500 shadow-orange-500/30",
      icon: "text-orange-500",
    };
  }
};

export function GameScoreCard({ data }) {
  const navigate = useNavigate();
  const { score, moves, time_seconds, game_id } = data;

  const rank = getRank({ score, game_id });
  const Renderer = gameRenderers[data.game_id];

  const isTrivia = data.game_id === "trivia";
  const isMemorama = data.game_id === "memory";

  const getTitleGame = (game_id) => {
    switch (game_id) {
      case "memory":
        return "Memorama";
      case "trivia":
        return "Trivia";
      default:
        return "Desconocido";
    }
  };

  const handleNavigate = () => {
    navigate(`/games/${game_id}`);
  };

  const getMessage = () => {
    if (isTrivia) {
      return `Respondió ${data.extra?.accuracy} de ${data.extra?.totalQuestions}`;
    }
    if (isMemorama) {
      return `Completado en ${data.time_seconds}s`;
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        mt-3 rounded-2xl border
        bg-white dark:bg-neutral-950
        border-gray-100 dark:border-neutral-800
        overflow-hidden
      "
    >
      {/* 🎮 HEADER */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="relative">
          <div
            className={`absolute -inset-2 blur-xl rounded-full bg-linear-to-br ${rank.glow}`}
          />
          <div
            className={`relative p-2 rounded-xl bg-linear-to-br ${rank.gradient}`}
          >
            <Trophy size={18} className="text-white" />
          </div>
        </div>

        <div className="flex-1">
          {/* <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Nuevo récord
          </p> */}
          <span className="text-[10px] text-gray-400 font-bold">
            {rank.label}
          </span>
        </div>

        {/* 🎮 etiqueta juego */}
        <span className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 dark:text-white">
          {getTitleGame(game_id)}
        </span>
      </div>

      {/* ⭐ SCORE */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2">
          <Star className="text-yellow-500" size={18} />
          <span className="text-2xl font-black dark:text-white">
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 📊 STATS */}
      {Renderer ? Renderer(data) : <div>Juego no soportado</div>}

      {/* ⚡ ACTIONS */}
      <div className="flex border-t border-gray-100 dark:border-neutral-800">
        <button
          onClick={handleNavigate}
          className="
            flex-1 py-3 text-sm font-bold
            flex items-center justify-center gap-2
            hover:bg-gray-50 dark:hover:bg-neutral-900
            transition dark:text-white
          "
        >
          <Zap size={16} className="text-emerald-500" />
          Intentar superar
        </button>

        <div className="w-px bg-gray-100 dark:bg-neutral-800" />

        <button
          className="
            flex-1 py-3 text-sm font-bold
            flex items-center justify-center gap-2
            hover:bg-gray-50 dark:hover:bg-neutral-900
            transition dark:text-white
          "
          onClick={() => navigate("/games/leaderboard")}
        >
          <Trophy size={16} className="text-amber-400" /> Ranking
        </button>
      </div>
    </motion.div>
  );
}

/* 📊 Mini stat */
const MiniStat = ({ icon: Icon, value, iconColor }) => (
  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-neutral-900 text-xs font-bold dark:text-white">
    <Icon size={14} className={`opacity-70 ${iconColor}`} />
    {value}
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-2">
    <div className="text-[10px] uppercase text-gray-400 font-bold">{label}</div>
    <div className="font-black text-sm dark:text-white">{value}</div>
  </div>
);

const gameRenderers = {
  trivia: (data) => (
    <div className="grid grid-cols-3 gap-2 text-center p-3">
      <Stat
        label="Aciertos"
        value={`${data.extra?.accuracy}/${data.extra?.totalQuestions}`}
      />
      <Stat
        label="Precisión"
        value={`${Math.round((data.extra?.accuracy / data.extra?.totalQuestions) * 100)}%`}
      />
      <Stat label="Tiempo" value={`${data.extra?.totalTime}`} />
    </div>
  ),

  memory: (data) => (
    <div className="grid grid-cols-3 gap-2 text-center p-3">
      <Stat label="Movimientos" value={data.moves} />
      <Stat label="Tiempo" value={`${data.time_seconds}s`} />
    </div>
  ),
};
