import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Trophy, Star, ArrowRight, Coins, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultsView = ({ points, accuracy, totalQuestions, earnedCredits, onReset }) => {
  const navigate = useNavigate();
  
  // Animación del contador de puntos
  const springPoints = useSpring(0, { stiffness: 40, damping: 20 });
  const displayPoints = useTransform(springPoints, (value) => Math.floor(value).toLocaleString());

  useEffect(() => {
    springPoints.set(points);
  }, [points, springPoints]);

  // Determinar rango basado en puntos
  const getRank = () => {
    if (points > 4000) return { label: 'ZAFIRO', color: 'text-indigo-400', bg: 'bg-emerald-500/10' };
    if (points > 3000) return { label: 'RUBY', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (points > 2000) return { label: 'DIAMANTE', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    if (points > 1500) return { label: 'ORO', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (points > 1000) return { label: 'PLATA', color: 'text-slate-400', bg: 'bg-slate-500/10' };
    return { label: 'BRONCE', color: 'text-orange-600', bg: 'bg-orange-500/10' };
  };

  const rank = getRank();

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
      {/* Icono Central con Brillo */}
      <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        transition={{ type: 'spring', bounce: 0.5 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 rounded-full animate-pulse" />
        <div className="relative bg-linear-to-tr from-emerald-500 to-teal-400 p-6 rounded-[2.5rem] shadow-2xl">
          <Trophy className="text-white w-12 h-12" />
        </div>
        
        {/* Badge de Rango */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border border-white/20 shadow-xl ${rank.bg} backdrop-blur-md`}
        >
          <span className={`text-[10px] font-black tracking-[0.2em] ${rank.color}`}>
            RANGO {rank.label}
          </span>
        </motion.div>
      </motion.div>

      {/* Contador de Puntos */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-10"
      >
        <motion.h2 className="text-6xl font-black dark:text-white tracking-tighter">
          {displayPoints}
        </motion.h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Puntos Totales</p>
      </motion.div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
        <StatCard 
          icon={<Target className="text-blue-500" size={18} />} 
          label="Precisión" 
          value={`${accuracy}/${totalQuestions}`} 
          delay={0.6}
        />
        <StatCard 
          icon={<Coins className="text-amber-500" size={18} />} 
          label="Créditos" 
          value={`+${earnedCredits} CC`} 
          delay={0.7}
        />
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Zap size={18} fill="currentColor" /> Reintentar
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/games')}
          className="py-4 bg-gray-100 dark:bg-neutral-900 dark:text-white rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2"
        >
          Volver al Arcade <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
};

// Subcomponente para las mini tarjetas
const StatCard = ({ icon, label, value, delay }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-gray-100 dark:border-neutral-800 flex flex-col items-center shadow-sm"
  >
    <div className="mb-2">{icon}</div>
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{label}</span>
    <span className="text-lg font-black dark:text-white">{value}</span>
  </motion.div>
);

export default ResultsView;