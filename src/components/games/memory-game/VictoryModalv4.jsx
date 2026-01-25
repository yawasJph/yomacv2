import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Hash, Star, RefreshCcw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

// 1. Sub-componente para las estadísticas (DRY)
const StatItem = ({ icon: Icon, label, value, colorClass, textColor }) => (
  <div className={`${colorClass} p-3 sm:p-5 rounded-2xl border transition-all flex flex-col items-center`}>
    <Icon className={`${textColor} mb-1`} size={20} />
    <span className={`block text-[10px] uppercase font-bold ${textColor} tracking-wider mb-1`}>
      {label}
    </span>
    <span className="text-xl sm:text-2xl font-black dark:text-white">
      {value}
    </span>
  </div>
);

const VictoryModal = memo(({ isOpen, score, time, moves, onReset }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && ( // ✅ Movemos la lógica aquí para que funcione la animación de salida
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-4xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            {/* Header con Trofeo */}
            <div className="bg-emerald-500 p-8 flex justify-center relative">
              <div className="relative flex justify-center">
                <motion.div
                  initial={{ rotate: -30, scale: 0.3, y: -20 }}
                  animate={{ rotate: 0, scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-yellow-300/50 blur-2xl rounded-full scale-150" />
                  <Trophy size={90} className="relative text-white drop-shadow-2xl" strokeWidth={1.5} />
                </motion.div>
              </div>
              {/* Círculos decorativos */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-white" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white" />
              </div>
            </div>

            <div className="p-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <h2 className="text-3xl font-black bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                  ¡Victoria Épica!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Has conquistado el desafío con maestría
                </p>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <StatItem 
                  icon={Clock} label="Tiempo" value={`${time}s`} 
                  colorClass="grand-blue"
                  textColor="text-blue-500 dark:text-blue-400"
                />
                <StatItem 
                  icon={Hash} label="Pasos" value={moves} 
                  colorClass="grand-purple"
                  textColor="text-purple-600 dark:text-purple-400"
                />

                <div className="col-span-2 p-6 rounded-2xl border-2 grand-yellow">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-yellow-400 w-12 h-12 rounded-xl flex items-center justify-center mb-2 mx-auto shadow-lg shadow-yellow-500/50"
                  >
                    <Star className="text-white fill-white" size={24} />
                  </motion.div>
                  <span className="block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider mb-1">
                    Puntuación Final
                  </span>
                  <span className="text-4xl font-black bg-linear-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                    {score.toLocaleString()} pts
                  </span>
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
      )}
    </AnimatePresence>
  );
});

export default VictoryModal;