import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Hash, Star, RefreshCcw, Home, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

const StatItem = ({ icon: Icon, value , color, gradient}) => (
  <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${gradient}`}>
    <Icon size={16} className={`opacity-70 ${color}`} />
    <span className="text-sm font-bold dark:text-white">{value}</span>
  </div>
);

const VictoryModal = memo(({ 
  isOpen, 
  score, 
  time, 
  moves, 
  onReset,
  onShare // 👈 nuevo
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="
              w-full sm:max-w-sm 
              rounded-t-3xl sm:rounded-3xl 
              bg-white dark:bg-gray-900 
              p-6 pb-7
              shadow-2xl border border-gray-200 dark:border-gray-800
            "
          >
            {/* 🏆 Icon + glow */}
            <div className="flex justify-center mb-4 relative">
              <div className="absolute w-20 h-20 bg-yellow-400/20 blur-2xl rounded-full" />
              <div className="bg-yellow-400 text-white p-4 rounded-2xl shadow-lg">
                <Trophy size={32} />
              </div>
            </div>

            {/* 🎯 Título */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-black dark:text-white">¡Victoria!</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Has completado el desafío
              </p>
            </div>

            {/* ⭐ Score (protagonista) */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
                <Star size={18} className="text-yellow-500" />
                <span className="text-2xl font-black dark:text-white">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 📊 Stats compactas */}
            <div className="flex justify-center gap-3 mb-6">
              <StatItem icon={Clock} value={`${time}s`} color={"text-blue-500 dark:text-blue-400"} gradient={"grand-blue"} />
              <StatItem icon={Hash} value={moves} color={"text-purple-600 dark:text-purple-400"} gradient={"grand-purple"}/>
            </div>

            {/* 🚀 Acciones */}
            <div className="space-y-2">
              
              {/* 🔥 Compartir */}
              <button
                onClick={onShare}
                className="
                  w-full py-3 
                  bg-linear-to-r from-indigo-500 to-purple-500 
                  text-white rounded-xl font-bold 
                  flex items-center justify-center gap-2
                  active:scale-95 transition-all
                  shadow-lg shadow-indigo-500/20
                "
              >
                <Share2 size={18} />
                Compartir en el feed
              </button>

              {/* 🔁 Reintentar */}
              <button
                onClick={onReset}
                className="
                  w-full py-3 
                  bg-emerald-500 hover:bg-emerald-600 
                  text-white rounded-xl font-bold 
                  flex items-center justify-center gap-2
                  active:scale-95 transition-all
                "
              >
                <RefreshCcw size={18} />
                Volver a jugar
              </button>

              {/* 🏠 Salir */}
              <button
                onClick={() => navigate("/games")}
                className="
                  w-full py-3 
                  bg-gray-100 dark:bg-gray-800 
                  text-gray-600 dark:text-gray-300 
                  rounded-xl font-bold 
                  flex items-center justify-center gap-2
                "
              >
                <Home size={18} />
                Ir al arcade
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

export default VictoryModal;