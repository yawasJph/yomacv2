import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Trophy,
  RefreshCcw,
  Home,
  Share2,
  Clock,
  Hash,
  Loader2,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo, useEffect, useState } from "react";
import { usePostCreation } from "@/hooks/usePostCreation3";
import { useAuth } from "@/context/AuthContext";

const VictoryModal = memo(({ isOpen, score, time, moves, onReset, accuracy }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  /* 🔢 Animación del score */
  const springScore = useSpring(0, { stiffness: 50, damping: 18 });
  const displayScore = useTransform(springScore, (v) =>
    Math.floor(v).toLocaleString(),
  );
  const { user } = useAuth();
  const { createPost, isPending } = usePostCreation();

  const handleShare = () => {
    createPost({
      user,
      files: [],
      gifUrls: [],
      content: "🎮 Resultado del juego",
      linkPreview: {
        type: "game_score",
        game_id: "memory",
        score,
        moves,
        time_seconds: time,
        accuracy
      },
      resetForm: () => {},
      setLoading,
      onGame: () => navigate("/games")
    });
  };

  useEffect(() => {
    springScore.set(score);
  }, [score]);

  /* 🏆 Ranking simple */
  const getRank = () => {
    if (score >= 800)
      return {
        label: "ORO",
        gradient: "from-amber-500 to-yellow-400",
        glow: "from-amber-500/30 to-yellow-400/30",
        button: "bg-amber-500",
      };
    if (score >= 700)
      return {
        label: "PLATA",
        gradient: "from-slate-400 to-gray-300",
        glow: "from-slate-400/30 to-gray-300/30",
        button: "bg-slate-500",
      };
    return {
      label: "BRONCE",
      gradient: "from-orange-500 to-red-400",
      glow: "from-orange-500/30 to-red-400/30",
      button: "bg-orange-500",
    };
  };

  const rank = getRank();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="
              w-full sm:max-w-md
              rounded-t-3xl sm:rounded-3xl
              bg-white dark:bg-neutral-950
              border border-gray-100 dark:border-neutral-800
              shadow-2xl
              p-5 sm:p-7
            "
          >
            {/* 🏆 HERO */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div
                  className={`absolute -inset-3 blur-2xl rounded-full bg-linear-to-br ${rank.glow}`}
                />
                <div
                  className={`relative p-4 rounded-2xl bg-linear-to-br ${rank.gradient}`}
                >
                  <Trophy className="text-white" size={28} />
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                  Resultado
                </p>
                <span className="text-[10px] font-black text-gray-500">
                  {rank.label}
                </span>
              </div>
            </div>

            {/* 🔢 SCORE */}
            <div className="text-center mb-6">
              <motion.div className="text-4xl sm:text-5xl font-black dark:text-white">
                {displayScore}
              </motion.div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Puntos
              </p>
            </div>

            {/* 📊 STATS */}
            <div className="flex justify-center gap-3 mb-6">
              <Stat
                icon={Clock}
                value={`${time}s`}
                iconColor={"text-blue-500 dark:text-blue-400"}
                gradient={"grand-blue"}
              />
              <Stat
                icon={Hash}
                value={moves}
                iconColor={"text-purple-500 dark:text-purple-400"}
                gradient={"grand-purple"}
              />
               <Stat
                icon={Target}
                value={`${accuracy}%`}
                iconColor={"text-amber-500 dark:text-amber-400"}
                gradient={"grand-yellow"}
              />
            </div>

            {/* 🚀 ACTIONS */}
            <div className="space-y-2">
              {/* 🔥 SHARE */}
              <button
                onClick={handleShare}
                className="
                  w-full py-3 rounded-xl text-white font-bold
                  bg-linear-to-r from-indigo-500 to-purple-500
                  flex items-center justify-center gap-2
                  shadow-lg shadow-indigo-500/20
                  active:scale-95 transition
                "
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {" "}
                    <Share2 size={18} />
                    Compartir
                  </>
                )}
              </button>

              {/* 🔁 RESET */}
              <button
                onClick={onReset}
                className={`
                  w-full py-3 rounded-xl text-white font-bold
                  flex items-center justify-center gap-2
                  active:scale-95 transition
                  ${rank.button}
                `}
                disabled={isPending}
              >
                <RefreshCcw size={18} />
                Reintentar
              </button>

              {/* 🏠 EXIT */}
              <button
                onClick={() => navigate("/games")}
                className="
                  w-full py-3 rounded-xl
                  bg-gray-100 dark:bg-neutral-900
                  text-gray-600 dark:text-gray-300
                  font-bold flex items-center justify-center gap-2
                "
                disabled={isPending}
              >
                <Home size={18} />
                Arcade
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

/* 📊 Stat mini */
const Stat = ({ icon: Icon, value, iconColor, gradient }) => (
  <div
    className={`flex flex-col items-center px-3 py-2 rounded-xl ${gradient}`}
  >
    <Icon size={16} className={`opacity-70 mb-1 ${iconColor}`} />
    <span className="text-sm font-black dark:text-white">{value}</span>
  </div>
);

export default VictoryModal;
