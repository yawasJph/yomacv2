import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Hash, Star, RefreshCcw, Home, Sparkles, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VictoryModal = ({ isOpen, score, time, moves, onReset }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  // Calcular estrellas según puntuación
  const stars = score >= 900 ? 3 : score >= 700 ? 2 : 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        {/* Fondo decorativo con partículas */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="relative bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-gray-200/50 dark:border-gray-700/50"
        >
          {/* Borde decorativo superior */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-yellow-500 to-blue-500" />

          {/* Header con efecto glow */}
          <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 sm:p-8 text-center overflow-hidden">
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
            
            {/* Confeti animado */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 left-6"
            >
              <Sparkles size={20} className="text-yellow-300" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="absolute top-8 right-8"
            >
              <Sparkles size={16} className="text-blue-300" />
            </motion.div>
            
            {/* Trofeo con animación */}
            <div className="relative z-10">
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block"
              >
                <Trophy size={64} className="text-white drop-shadow-lg" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-4 mb-1">¡Victoria!</h2>
              <p className="text-emerald-100 text-sm opacity-90">Has completado el desafío</p>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-6 sm:p-8">
            {/* Sistema de estrellas */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((star) => (
                <motion.div
                  key={star}
                  initial={{ scale: 0 }}
                  animate={{ scale: star <= stars ? 1 : 0.7 }}
                  transition={{ delay: star * 0.1 }}
                >
                  <Star
                    size={28}
                    className={`${star <= stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-700'}`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Stats Grid - Versión compacta */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {/* Tiempo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock size={18} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">TIEMPO</span>
                </div>
                <span className="text-2xl font-bold dark:text-white block">{time}s</span>
              </motion.div>

              {/* Pasos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Hash size={18} className="text-blue-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">PASOS</span>
                </div>
                <span className="text-2xl font-bold dark:text-white block">{moves}</span>
              </motion.div>

              {/* Eficiencia */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target size={18} className="text-purple-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">EFIC.</span>
                </div>
                <span className="text-2xl font-bold dark:text-white block">
                  {moves > 0 ? Math.round((16 / moves) * 100) / 10 : 0}x
                </span>
              </motion.div>
            </div>

            {/* Puntuación Final - Destacada */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative bg-gradient-to-r from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/5 dark:to-blue-500/5 p-6 rounded-2xl border border-emerald-500/20 mb-8 overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 opacity-20">
                <Award size={64} className="text-emerald-500" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                Puntuación Final
              </span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl sm:text-5xl font-black dark:text-white">{score}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">pts</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score / 10}%` }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-full"
                />
              </div>
            </motion.div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                <RefreshCcw size={20} />
                Jugar Otra Vez
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/games")}
                className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
              >
                <Home size={20} />
                Volver al Arcade
              </motion.button>
            </div>
          </div>

          {/* Footer decorativo */}
          <div className="px-6 py-3 text-center border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ¡Sigue desafiando tu memoria!
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VictoryModal;