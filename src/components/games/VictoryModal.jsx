
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Hash, Star, RefreshCcw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VictoryModal = ({ isOpen, score, time, moves, onReset }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm max-h-180 sm:max-h-screen">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-4xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          {/* Header con Trofeo */}
          <div className="bg-emerald-500 p-8 flex justify-center relative">
            <motion.div
              initial={{ rotate: -20, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <Trophy size={80} className="text-white drop-shadow-lg" />
            </motion.div>
            {/* Círculos decorativos */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-white" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white" />
            </div>
          </div>

          <div className="p-8 text-center">
            <h2 className="text-2xl font-black dark:text-white mb-1">¡Increíble Victoria!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Has completado el desafío con éxito.</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <Clock className="text-emerald-500 mx-auto mb-1" size={20} />
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tiempo</span>
                <span className="text-xl font-black dark:text-white">{time}s</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <Hash className="text-blue-500 mx-auto mb-1" size={20} />
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pasos</span>
                <span className="text-xl font-black dark:text-white">{moves}</span>
              </div>
              <div className="bg-emerald-500/10 dark:bg-emerald-500/5 col-span-2 p-4 rounded-2xl border border-emerald-500/20">
                <Star className="text-yellow-500 mx-auto mb-1 fill-yellow-500" size={24} />
                <span className="block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Puntuación Final</span>
                <span className="text-3xl font-black dark:text-white">{score} pts</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              <button
                onClick={onReset}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/25"
              >
                <RefreshCcw size={20} /> Volver a Jugar
              </button>
              <button
                onClick={() => navigate("/games")}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Home size={20} /> Ir al Arcade
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VictoryModal;