import { useAuth } from "@/context/AuthContext";
import { usePostCreation } from "@/hooks/usePostCreation3";
import { motion } from "framer-motion";
import {
  Clock,
  Flag,
  Trophy,
  Coins,
  Zap,
  ArrowRight,
  Share2,
  Loader2,
  XCircle,
  FileX2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShareButtonGame } from "../utils/ShareButtonGame";
import { useState } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";

const getRank = (points) => {
  if (points >= 900)
    return {
      label: "DIAMANTE",
      text: "text-cyan-400",
      gradient: "from-cyan-500 to-sky-400",
      glow: "from-cyan-500/40 to-sky-400/40",
      button: "bg-cyan-500 shadow-cyan-500/30",
      icon: "text-cyan-500",
    };
  if (points >= 700)
    return {
      label: "ORO",
      text: "text-amber-400",
      gradient: "from-amber-500 to-yellow-400",
      glow: "from-amber-500/40 to-yellow-400/40",
      button: "bg-amber-500 shadow-amber-500/30",
      icon: "text-amber-500",
    };
  if (points >= 500)
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
};

const calculateScore = ({ timer, flagsUsed, minesCount, isWin }) => {
  if (!isWin) return 0;
  let score = 1000;

  // ⏱️ TIEMPO (importante pero no dominante)
  score -= timer * 5;

  // 🚩 EFICIENCIA DE FLAGS
  // ideal = usar pocas flags (skill alto)
  const flagRatio = flagsUsed / minesCount;

  // mientras menos uses, mejor
  const efficiencyBonus = (1 - flagRatio) * 300;
  score += efficiencyBonus;

  // 💣 USO EXCESIVO (castigo si usa todas)
  if (flagsUsed === minesCount) {
    score -= 100;
  }

  // 🧠 BONUS PRO (casi sin flags)
  if (flagsUsed <= 3) {
    score += 150;
  }

  // 💎 PERFECT RUN (rápido + pocas flags)
  if (timer < 60 && flagsUsed <= 5) {
    score += 150;
  }

  return Math.max(Math.floor(score), 100);
};

const BuscaMinasResults = ({
  gameState = "",
  timer = 0,
  flagsUsed = 0,
  minesCount = 0,
  clicks = 0,
  onReset,
  isNewRecord,
}) => {
  const isWin = gameState === "won";
  const score2 = calculateScore({ timer, flagsUsed, minesCount, isWin });
  const [isLoading, setIsLoading] = useState(false);
  const { createPost, isPending } = usePostCreation();
  const { user } = useAuth();
  const rank = getRank(score2);
  const navigate = useNavigate();

  const handleShare = async () => {
    setIsLoading(true);
    createPost({
      user,
      files: [],
      gifUrls: [],
      content: "🎮 Resultado del juego",
      linkPreview: {
        type: "game_score",
        game_id: "busca_minas",
        score: score2,
        extra: {
          flags: `${flagsUsed}/${minesCount}`,
          timer,
          clicks,
        },
      },
      resetForm: () => {},
      setLoading: () => {},
      onGame: () => navigate("/games"),
    });
    // 💰 Dar recompensa
    await supabaseClient.rpc("increment_credits", {
      user_id: user.id,
      amount: 20,
    });
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div className="sm:max-w-md max-w-full w-full  p-6 sm:rounded-[2.5rem] text-center bg-white dark:bg-neutral-950 shadow-2xl border-2 border-gray-100 dark:border-neutral-800 sm:relative overflow-hidden fixed bottom-0 ">
        {/* Adorno de fondo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative  p-5"
        >
          {/* ===== HERO ===== */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* <div className="relative">
              <div
                className={`absolute -inset-4 rounded-full blur-3xl bg-linear-to-br ${rank.glow}`}
              />
              <div
                className={`relative p-6 rounded-4xl bg-linear-to-br ${rank.gradient} shadow-2xl`}
              >
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <span
                className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md border border-white/20 ${rank.text} bg-black/30`}
              >
                {rank.label}
              </span>
            </div> */}
            <div className="relative">
              {/* Glow */}
              <div
                className={`absolute -inset-4 rounded-full blur-3xl bg-linear-to-br ${
                  isWin ? rank.glow : "from-red-500/30 to-gray-500/20"
                }`}
              />

              {/* Icon container */}
              <div
                className={`relative p-6 rounded-4xl shadow-2xl bg-linear-to-br ${
                  isWin ? rank.gradient : "from-gray-700 to-gray-900"
                }`}
              >
                {isWin ? (
                  <Trophy className="w-12 h-12 text-white" />
                ) : (
                  <FileX2 className="w-12 h-12 text-red-400" />
                )}
              </div>

              {/* Label */}
              <span
                className={`
                absolute -bottom-3 left-1/2 -translate-x-1/2
                px-4 py-1 rounded-full text-[10px] font-black tracking-widest
                backdrop-blur-md border border-white/20
                ${isWin ? rank.text : "text-red-300"}
                bg-black/30
              `}
              >
                {isWin ? rank.label : "05"}
              </span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-sm uppercase tracking-widest text-gray-400 font-bold">
                {isWin ? "Resultado Final" : "Jalado"}
              </h2>
              {isWin && (
                <>
                  <motion.div className="text-5xl md:text-7xl font-black tracking-tight dark:text-white mt-2">
                    {score2}
                  </motion.div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">
                    Puntos Totales
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ===== STATS ===== */}
          {gameState === "won" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-3 sm:mt-8">
              <StatCard
                icon={<Clock size={18} />}
                label="Tiempo"
                value={timer}
                color={rank.icon}
              />
              <StatCard
                icon={<Flag size={18} />}
                label="Banderas"
                value={`${flagsUsed}/${minesCount}`}
                color={rank.icon}
              />
              <StatCard
                icon={<Coins size={18} />}
                label="Creditos"
                value={Math.floor(score2 / 100)}
                color={rank.icon}
              />
              <StatCard
                icon={<Zap size={18} />}
                label="Clicks"
                value={clicks}
                color={rank.icon}
              />
            </div>
          )}

          {/* ===== ACTIONS ===== */}
          <div className="flex flex-col  gap-3 mt-3 sm:mt-8">
            {isNewRecord && gameState === "won" && (
              <ShareButtonGame
                onLoading={isLoading}
                onShare={() => handleShare()}
              />
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onReset}
              className={`flex-1 py-3 rounded-2xl text-white font-black uppercase tracking-wider shadow-lg
             ${rank.button} flex items-center justify-center gap-2`}
              disabled={isLoading}
            >
              <Zap size={18} fill="currentColor" /> Reintentar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/games")}
              className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-neutral-900 dark:text-white font-black uppercase tracking-wider flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              Volver al Arcade <ArrowRight size={18} />
            </motion.button>

            {/* 🚀 SHARE */}
            {/* {gameState === "won" && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleShare}
                className="
                w-full py-3 rounded-2xl
                bg-linear-to-r from-emerald-500 to-teal-400
                text-white font-black uppercase tracking-wider
                flex items-center justify-center gap-2
                shadow-lg shadow-emerald-500/20
              "
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Share2 size={18} /> Publicar resultado
                  </>
                )}
              </motion.button>
            )} */}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 rounded-2xl p-3 md:p-5 border border-gray-100 dark:border-neutral-800">
    <div className={`mb-1 ${color}`}>{icon}</div>
    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
      {label}
    </span>
    <span className="text-base md:text-lg font-black dark:text-white">
      {value}
    </span>
  </div>
);

export default BuscaMinasResults;
