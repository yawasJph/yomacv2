import {
  Bomb,
  Home,
  Loader2,
  Share2,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePostCreation } from "@/hooks/usePostCreation3";
import { useAuth } from "@/context/AuthContext";

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

const CazaTalentosResults = ({ score, onReset, time, talent, bomb }) => {
  const navigate = useNavigate();
  const { createPost, isPending } = usePostCreation();
  const { user } = useAuth();

  const handleShare = () => {
    createPost({
      user,
      files: [],
      gifUrls: [],
      content: "🎮 Resultado del juego",
      linkPreview: {
        type: "game_score",
        game_id: "caza_talentos",
        score: score,
        extra: {
          talent,
          bomb,
          time,
        },
      },
      setLoading: () => {},
      resetForm: () => {},
      onGame: () => {
        navigate("/games");
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-3 dark:bg-neutral-950/98 bg-white backdrop-blur-2xl z-60 text-center"
    >
      {/* Icono Central con Brillo Radial */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative mb-3"
      >
        <div
          className={`absolute inset-0 ${getRank(score).bg} blur-[60px] opacity-30 rounded-full animate-pulse`}
        />
        <div
          className={`relative bg-linear-to-br ${getRank(score).gradient} p-7 rounded-[2.5rem] shadow-2xl `}
        >
          <Trophy className="text-white w-14 h-14" />
        </div>

        {/* Badge de Rango Dinámico */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full border border-white/10 shadow-2xl ${getRank(score).bg} backdrop-blur-md whitespace-nowrap`}
        >
          <span
            className={`text-[10px] font-black tracking-[0.2em] ${getRank(score).color}`}
          >
            RANGO {getRank(score).label}
          </span>
        </motion.div>
      </motion.div>

      {/* Contador de Puntos con Estilo Arcade */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-5"
      >
        <h2 className="text-6xl font-black text-white tracking-tighter italic">
          {score}
        </h2>
        <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">
          Puntos Totales
        </p>
      </motion.div>

      {/* Grid de Estadísticas con los rangos */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-5">
        <div className="dark:bg-neutral-900/50 bg-gray-100 p-4 rounded-3xl border dark:border-neutral-800 border-neutral-300 flex flex-col items-center">
          <Target className="text-blue-500 mb-2" size={20} />
          <span className="text-[10px] font-bold text-neutral-500 uppercase">
            Talentos
          </span>
          <span className="text-lg font-black text-black dark:text-white">
            {talent}
          </span>
        </div>

        <div className="dark:bg-neutral-900/50 bg-gray-100 p-4 rounded-3xl border dark:border-neutral-800 border-neutral-300 flex flex-col items-center">
          <Bomb className="text-red-500 mb-2" size={20} />
          <span className="text-[10px] font-bold text-neutral-500 uppercase">
            Bombas
          </span>
          <span className="text-lg font-black text-black dark:text-white">
            {bomb}
          </span>
        </div>

        {/* {isMobile && (
          <>
            <div className="bg-neutral-900/50 p-4 rounded-3xl border border-neutral-800 flex flex-col items-center">
              <Zap className="text-cyan-500 mb-2" size={20} />
              <span className="text-[10px] font-bold text-neutral-500 uppercase">
                Tiempo
              </span>
              <span className="text-lg font-black text-white">{time}</span>
            </div>

            <div className="bg-neutral-900/50 p-4 rounded-3xl border border-neutral-800 flex flex-col items-center">
              <Coins className="text-amber-500 mb-2" size={20} />
              <span className="text-[10px] font-bold text-neutral-500 uppercase">
                Creditos
              </span>
              <span className="text-lg font-black text-white">
                {Math.floor(score/100)}
              </span>
            </div>
          </>
        )} */}
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
          disabled={isPending}
        >
          <Zap size={18} fill="currentColor" /> Reintentar
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/games")}
          className="py-4 bg-neutral-900/80 text-neutral-400 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-neutral-800"
          disabled={isPending}
        >
          <Home size={18} /> Menu Principal
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-neutral-800"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={18} />
          ) : (
            <>
              {" "}
              <Share2 size={18} /> Publicar
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CazaTalentosResults;

const Stat = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-2">
    <div className="text-[10px] uppercase text-gray-400 font-bold">{label}</div>
    <div className="font-black text-sm dark:text-white">{value}</div>
  </div>
);
