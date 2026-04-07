import { motion } from "framer-motion";
import { Trophy, Clock, Hash, Star, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* 🏆 Ranking visual */
const getRank = ({score}) => {
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
};

export function GameScoreCard({ data }) {
  const navigate = useNavigate();
  const { score, moves, time_seconds, game_id } = data;

  const rank = getRank({score});

  const getTitleGame = (game_id) => {
    switch (game_id) {
      case "memory":
        return "Memorama";
      default:
        return "Desconocido";
    }
  };

  const handleNavigate = () => {
    navigate(`/games/${game_id}`);
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
          <span className="text-[10px] text-gray-400 font-bold">{rank.label}</span>
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
      <div className="flex gap-2 px-4 pb-4">
        <MiniStat
          icon={Clock}
          value={`${time_seconds}s`}
          iconColor={"text-blue-500 dark:text-blue-400"}
        />
        <MiniStat
          icon={Hash}
          value={moves}
          iconColor={"text-purple-500 dark:text-purple-400"}
        />
      </div>

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
