import { ArrowLeft, Swords } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchingScreen = ({ onBack }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center justify-center min-h-[50vh] p-6"
  >
    <div className="relative flex items-center justify-center mb-6">
      {/* Círculo de fondo con gradiente */}
      <div className="absolute w-24 h-24 rounded-full bg-linear-to-br from-emerald-500/10 to-emerald-600/5 blur-sm" />
      
      {/* Contenedor principal para espadas y borde */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Borde circular animado (loader) */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: '#10b981',
            borderRightColor: '#34d399',
            borderBottomColor: '#10b981',
            borderLeftColor: '#34d399',
            borderWidth: '3px'
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Espadas cruzadas en el centro */}
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Swords 
            size={32} 
            className="text-emerald-400 drop-shadow-lg"
          />
        </motion.div>
        
        {/* Puntos decorativos en el borde */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-150" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-300" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-450" />
      </div>
    </div>

    {/* Texto con animación */}
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-center mb-8"
    >
      <h2 className="text-lg font-bold uppercase tracking-widest dark:text-white mb-2">
        Buscando Oponente
      </h2>
      <motion.div
        className="flex justify-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            className="text-emerald-500 text-2xl"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            .
          </motion.span>
        ))}
      </motion.div>
    </motion.div>

    {/* Botón con mejor diseño */}
    <motion.button
      onClick={onBack}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group relative px-6 py-3 overflow-hidden rounded-lg bg-linear-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 border border-gray-700 dark:border-gray-800"
    >
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-linear-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="relative flex items-center justify-center gap-3">
        <ArrowLeft 
          size={16} 
          className="text-gray-400 group-hover:text-emerald-400 transition-colors duration-300" 
        />
        <span className="text-gray-300 group-hover:text-white font-semibold text-sm uppercase tracking-wider transition-colors duration-300">
          Cancelar Búsqueda
        </span>
      </div>
    </motion.button>

    {/* Indicador de estado */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs"
    >
      Esta operación puede tardar unos segundos
    </motion.p>
  </motion.div>
);

export default SearchingScreen;