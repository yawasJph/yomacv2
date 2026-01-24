import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Hash, Star, RefreshCcw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VictoryModal = ({ isOpen, score, time, moves, onReset }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ">
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
                  animate={{ 
                    rotate: 0, 
                    scale: 1, 
                    y: 0 
                  }}
                  transition={{ 
                    type: "spring", 
                    damping: 12,
                    stiffness: 200,
                    delay: 0.1
                  }}
                  className="relative"
                >
                  {/* Glow del trofeo */}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-3 sm:mb-6"
              >
                <h2 className="text-3xl font-black bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                  ¡Victoria Épica!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Has conquistado el desafío con maestría
                </p>
              </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5 sm:mb-8">
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-800/30 
                transition-all">
                <Clock className="text-blue-500 dark:text-blue-400 mx-auto mb-1" size={20} />
                <span className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">Tiempo</span>
                <span className="text-xl sm:text-2xl font-black dark:text-white ">{time}s</span>
              </div>
              <div className=" bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/30 transition-all">
                <Hash className="text-purple-600 dark:text-purple-400 mx-auto" size={20} />
                <span className="block text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider ">Pasos</span>
                <span className="text-xl sm:text-2xl font-black dark:text-white">{moves}</span>
              </div>
              <div className="col-span-2 bg-linear-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border-2 border-yellow-200 dark:border-yellow-700/30 transition-all">
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-linear-to-br from-yellow-400 to-amber-500 w-12 h-12 rounded-xl flex items-center justify-center mb-2 mx-auto shadow-lg shadow-yellow-500/50"
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

            {/* Stats Grid mejorado */}
          

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
