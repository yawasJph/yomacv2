import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Hash, Star, RefreshCcw, Home, Sparkles } from "lucide-react";

const VictoryModal = ({ isOpen, score, time, moves, onReset, onGoToArcade }) => {
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop mejorado con blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-linear-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md"
        />
        
        {/* Partículas de celebración */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -20,
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                y: window.innerHeight + 20,
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                rotate: Math.random() * 360
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 3
              }}
              className="absolute"
            >
              <Sparkles 
                size={16 + Math.random() * 16} 
                className="text-yellow-400"
                fill="currentColor"
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-blue-500/20 blur-3xl rounded-full" />
          
          {/* Card principal */}
          <div className="relative bg-linear-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/50">
            
            {/* Header con gradiente y trofeo */}
            <div className="relative bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-600 p-10 overflow-hidden">
              {/* Patrón de fondo */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" 
                     style={{
                       backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                       backgroundSize: '20px 20px'
                     }} 
                />
              </div>
              
              {/* Círculos decorativos animados */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.2, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" 
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/20 blur-2xl" 
              />
              
              {/* Trofeo con animación */}
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

              {/* Estrellas flotantes */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.8],
                    y: [-20, -60, -80]
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.3 + i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="absolute"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: '50%'
                  }}
                >
                  <Star size={12 + i * 2} className="text-yellow-300 fill-yellow-300" />
                </motion.div>
              ))}
            </div>

            {/* Contenido */}
            <div className="p-8">
              {/* Título con gradiente */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <h2 className="text-3xl font-black bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                  ¡Victoria Épica!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Has conquistado el desafío con maestría
                </p>
              </motion.div>

              {/* Stats Grid mejorado */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30 transition-all"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 rounded-2xl transition-all" />
                  <div className="relative">
                    <div className="bg-blue-500/10 w-10 h-10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Clock className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <span className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">Tiempo</span>
                    <span className="text-2xl font-black dark:text-white">{time}s</span>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/30 transition-all"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/10 group-hover:to-pink-400/10 rounded-2xl transition-all" />
                  <div className="relative">
                    <div className="bg-purple-500/10 w-10 h-10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Hash className="text-purple-600 dark:text-purple-400" size={20} />
                    </div>
                    <span className="block text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider mb-1">Pasos</span>
                    <span className="text-2xl font-black dark:text-white">{moves}</span>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative col-span-2 bg-linear-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border-2 border-yellow-200 dark:border-yellow-700/30 transition-all"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-400/0 to-orange-400/0 group-hover:from-yellow-400/10 group-hover:to-orange-400/10 rounded-2xl transition-all" />
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="bg-linear-to-br from-yellow-400 to-amber-500 w-12 h-12 rounded-xl flex items-center justify-center mb-2 mx-auto shadow-lg shadow-yellow-500/50"
                    >
                      <Star className="text-white fill-white" size={24} />
                    </motion.div>
                    <span className="block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider mb-1">Puntuación Final</span>
                    <span className="text-4xl font-black bg-linear-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                      {score.toLocaleString()} pts
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Botones con mejor diseño */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onReset}
                  className="w-full py-4 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
                >
                  <RefreshCcw size={20} /> Volver a Jugar
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onGoToArcade}
                  className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-gray-200 dark:border-gray-700"
                >
                  <Home size={20} /> Ir al Arcade
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VictoryModal;