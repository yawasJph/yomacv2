import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Zap } from 'lucide-react';

const StoreBannerWidget = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/games/store')}
      className="relative cursor-pointer group overflow-hidden bg-linear-to-br from-indigo-600 via-emerald-500 to-teal-500 p-1 rounded-[2.5rem] shadow-lg shadow-emerald-500/20 mt-2"
    >
      {/* Capa interna para el efecto de borde */}
      <div className="bg-white dark:bg-neutral-950 rounded-[2.3rem] p-6 h-full w-full relative overflow-hidden">
        
        {/* Elementos Decorativos Animados (Fondo) */}
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"
        />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Icono Central con Salto animado */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4 relative"
          >
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150" />
            <div className="relative bg-linear-to-tr from-emerald-500 to-teal-400 p-4 rounded-2xl shadow-inner">
              <ShoppingBag className="text-white w-8 h-8" strokeWidth={2.5} />
            </div>
            
            {/* Chispas flotantes */}
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-2 -right-2 text-amber-400"
            >
              <Sparkles size={16} />
            </motion.div>
          </motion.div>

          {/* Texto de Llamada a la Acción */}
          <h3 className="text-lg font-black bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-1">
            YoMAC Store
          </h3>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
            Personaliza tu Perfil
          </p>

          {/* Botón Estilizado */}
          <div className="flex items-center gap-2 bg-emerald-500 px-5 py-2.5 rounded-xl text-white font-black text-[10px] uppercase tracking-wider group-hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
            <Zap size={14} fill="currentColor" />
            Explorar Tienda
          </div>
        </div>

        {/* Efecto de Brillo que cruza el widget al hacer hover */}
        <motion.div 
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      </div>
    </motion.div>
  );
};

export default StoreBannerWidget;