import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import {
  Trophy,
  ArrowRight,
  Coins,
  Zap,
  Target,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResultsView = ({
  points,
  accuracy,
  totalQuestions,
  earnedCredits,
  onReset,
}) => {
  const navigate = useNavigate();

  /* ===== Animación de puntos ===== */
  const springPoints = useSpring(0, { stiffness: 50, damping: 18 });
  const displayPoints = useTransform(springPoints, (v) =>
    Math.floor(v).toLocaleString(),
  );

  useEffect(() => {
    springPoints.set(points);
  }, [points, springPoints]);

  /* ===== Ranking ===== */
  const getRank = () => {
    if (points >= 4000)
      return {
        label: "ZAFIRO",
        text: "text-indigo-400",
        gradient: "from-indigo-500 to-cyan-400",
        glow: "from-indigo-500/40 to-cyan-400/40",
        button: "bg-indigo-500 shadow-indigo-500/30",
        icon: "text-indigo-500",
      };
    if (points >= 3000)
      return {
        label: "RUBÍ",
        text: "text-red-400",
        gradient: "from-red-500 to-pink-400",
        glow: "from-red-500/40 to-pink-400/40",
        button: "bg-red-500 shadow-red-500/30",
        icon: "text-red-500",
      };
    if (points >= 2000)
      return {
        label: "DIAMANTE",
        text: "text-cyan-400",
        gradient: "from-cyan-500 to-sky-400",
        glow: "from-cyan-500/40 to-sky-400/40",
        button: "bg-cyan-500 shadow-cyan-500/30",
        icon: "text-cyan-500",
      };
    if (points >= 1500)
      return {
        label: "ORO",
        text: "text-amber-400",
        gradient: "from-amber-500 to-yellow-400",
        glow: "from-amber-500/40 to-yellow-400/40",
        button: "bg-amber-500 shadow-amber-500/30",
        icon: "text-amber-500",
      };
    if (points >= 1000)
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

  const rank = getRank();

  return (
    <div className="flex items-center justify-center pt-20 px-4">
      <div className="w-full max-w-4xl">
        {/* ===== CONTENEDOR PRINCIPAL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-neutral-950 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-xl md:p-12 p-5"
        >
          {/* ===== HERO ===== */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div
                className={`absolute -inset-4 rounded-full blur-3xl bg-gradient-to-br ${rank.glow}`}
              />
              <div
                className={`relative p-6 rounded-[2rem] bg-gradient-to-br ${rank.gradient} shadow-2xl`}
              >
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <span
                className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md border border-white/20 ${rank.text} bg-black/30`}
              >
                {rank.label}
              </span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-sm uppercase tracking-widest text-gray-400 font-bold">
                Resultado Final
              </h2>
              <motion.div className="text-5xl md:text-7xl font-black tracking-tight dark:text-white mt-2">
                {displayPoints}
              </motion.div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">
                Puntos Totales
              </p>
            </div>
          </div>

          {/* ===== STATS ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-8">
            <StatCard
              icon={<Target size={18} />}
              label="Precisión"
              value={`${accuracy}/${totalQuestions}`}
               color={rank.icon}
            />
            <StatCard
              icon={<CheckCircle size={18} />}
              label="Exactitud"
              value={`${Math.round((accuracy / totalQuestions) * 100)}%`}
               color={rank.icon}
            />
            <StatCard
              icon={<Coins size={18} />}
              label="Créditos"
              value={`+${earnedCredits}`}
               color={rank.icon}
            />
            <StatCard
              icon={<Zap size={18} />}
              label="Bonus"
              value={earnedCredits > 0 ? "ACTIVO" : "—"}
               color={rank.icon}
            />
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex flex-col md:flex-row gap-3 mt-8">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onReset}
              className={`flex-1 py-4 rounded-2xl text-white font-black uppercase tracking-wider shadow-lg
             ${rank.button} flex items-center justify-center gap-2`}
            >
              <Zap size={18} fill="currentColor" /> Reintentar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/games")}
              className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-neutral-900 dark:text-white font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Volver al Arcade <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ===== STAT CARD ===== */

const StatCard = ({ icon, label, value, color }) => (
  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 rounded-2xl p-3 md:p-5 border border-gray-100 dark:border-neutral-800">
    <div className={`mb-1 ${color}`}>{icon}</div>
    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{label}</span>
    <span className="text-base md:text-lg font-black dark:text-white">{value}</span>
  </div>
);

export default ResultsView;
