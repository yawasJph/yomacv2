import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, Coins, Zap, Target, Sparkles, Award, TrendingUp, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultsView = ({ points, accuracy, totalQuestions, earnedCredits, onReset }) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Animación del contador de puntos
  const springPoints = useSpring(0, { stiffness: 60, damping: 15 });
  const displayPoints = useTransform(springPoints, (value) => Math.floor(value).toLocaleString());

  useEffect(() => {
    springPoints.set(points);
    // Ocultar confeti después de 3 segundos
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [points, springPoints]);

  // Determinar rango basado en puntos
  const getRank = () => {
    if (points > 4000) return { 
      label: 'ZAFIRO', 
      color: 'text-blue-300', 
      gradient: 'from-blue-400 to-cyan-300',
      bg: 'bg-gradient-to-r from-blue-900/20 to-cyan-900/10',
      icon: <Sparkles className="w-4 h-4" />
    };
    if (points > 3000) return { 
      label: 'RUBY', 
      color: 'text-red-300', 
      gradient: 'from-red-400 to-pink-300',
      bg: 'bg-gradient-to-r from-red-900/20 to-pink-900/10',
      icon: <Star className="w-4 h-4" />
    };
    if (points > 2000) return { 
      label: 'DIAMANTE', 
      color: 'text-cyan-300', 
      gradient: 'from-cyan-400 to-teal-300',
      bg: 'bg-gradient-to-r from-cyan-900/20 to-teal-900/10',
      icon: <Award className="w-4 h-4" />
    };
    if (points > 1500) return { 
      label: 'ORO', 
      color: 'text-amber-300', 
      gradient: 'from-amber-400 to-yellow-300',
      bg: 'bg-gradient-to-r from-amber-900/20 to-yellow-900/10',
      icon: <Trophy className="w-4 h-4" />
    };
    if (points > 1000) return { 
      label: 'PLATA', 
      color: 'text-gray-300', 
      gradient: 'from-gray-300 to-slate-300',
      bg: 'bg-gradient-to-r from-gray-900/20 to-slate-900/10',
      icon: <TrendingUp className="w-4 h-4" />
    };
    return { 
      label: 'BRONCE', 
      color: 'text-orange-300', 
      gradient: 'from-orange-500 to-amber-400',
      bg: 'bg-gradient-to-r from-orange-900/20 to-amber-900/10',
      icon: <Award className="w-4 h-4" />
    };
  };

  const rank = getRank();
  const accuracyPercentage = Math.round((accuracy / totalQuestions) * 100);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[600px] p-6 overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900" />
      
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ y: -20, opacity: 0 }}
            animate={{ 
              y: window.innerHeight,
              opacity: [0, 1, 0],
              x: Math.sin(i * 0.5) * 50
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.2
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Confeti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-3 h-3 ${i % 5 === 0 ? 'bg-yellow-400' : i % 4 === 0 ? 'bg-blue-400' : i % 3 === 0 ? 'bg-emerald-400' : i % 2 === 0 ? 'bg-red-400' : 'bg-purple-400'} rounded-sm`}
                initial={{ y: -50, x: Math.random() * window.innerWidth, rotate: 0 }}
                animate={{ 
                  y: window.innerHeight,
                  rotate: 360,
                  x: Math.random() * window.innerWidth - window.innerWidth / 2
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5 + Math.random() * 2,
                  ease: "easeOut"
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-2xl">

        {/* Cabecera con título */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            ¡Resultados Finales!
          </h1>
          <p className="text-gray-300 mt-2">Desempeño en la trivia</p>
        </motion.div>

        {/* Contenedor principal de resultados */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          
          {/* Sección izquierda - Trofeo y rango */}
          <div className="flex-1 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ 
                type: 'spring', 
                bounce: 0.6,
                delay: 0.3
              }}
              className="relative mb-8"
            >
              {/* Efecto de brillo */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-teal-400/30 to-cyan-500/30 blur-2xl rounded-full"
              />
              
              <div className="relative bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-400 p-8 rounded-3xl shadow-2xl shadow-emerald-500/30">
                <Trophy className="text-white w-16 h-16" strokeWidth={1.5} />
                
                {/* Destellos alrededor del trofeo */}
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full blur-sm"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-2 -left-2 w-6 h-6 bg-cyan-400 rounded-full blur-sm"
                />
              </div>
              
              {/* Badge de Rango */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full ${rank.bg} backdrop-blur-lg border border-white/10 shadow-2xl flex items-center gap-2`}
              >
                {rank.icon}
                <span className={`text-sm font-black tracking-wider bg-gradient-to-r ${rank.gradient} bg-clip-text text-transparent`}>
                  {rank.label}
                </span>
              </motion.div>
            </motion.div>

            {/* Puntuación */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700/50">
                <motion.h2 
                  className="text-7xl font-black tracking-tight bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent p-2"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {displayPoints}
                </motion.h2>
              </div>
              <p className="text-gray-400 font-medium uppercase tracking-wider text-sm mt-4">Puntuación Total</p>
            </motion.div>
          </div>

          {/* Sección derecha - Estadísticas y botones */}
          <div className="flex-1 w-full">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <StatCard 
                icon={<Target className="text-blue-400" size={20} />} 
                label="Precisión" 
                value={`${accuracyPercentage}%`}
                subValue={`${accuracy}/${totalQuestions} correctas`}
                delay={0.6}
                gradient="from-blue-500 to-cyan-400"
              />
              <StatCard 
                icon={<Coins className="text-amber-400" size={20} />} 
                label="Créditos Ganados" 
                value={`+${earnedCredits} CC`}
                subValue="Disponibles en tu cuenta"
                delay={0.7}
                gradient="from-amber-500 to-yellow-400"
              />
              
              {/* Barra de precisión */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.9, duration: 1.5 }}
                className="mt-4"
              >
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-300">Progreso de precisión</span>
                  <span className="font-semibold text-emerald-400">{accuracyPercentage}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracyPercentage}%` }}
                    transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  />
                </div>
              </motion.div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col gap-4">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="relative py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl font-bold uppercase tracking-wider shadow-xl flex items-center justify-center gap-3 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Zap size={20} className="relative z-10" />
                <span className="relative z-10">Jugar Otra Vez</span>
                <RefreshCw size={16} className="relative z-10 ml-auto" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(75, 85, 99, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/games')}
                className="py-4 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 text-gray-200 rounded-2xl font-bold uppercase tracking-wider flex items-center justify-center gap-3 hover:border-gray-600 transition-colors"
              >
                <Home size={20} />
                <span>Volver al Menú</span>
                <ArrowRight size={16} className="ml-auto" />
              </motion.button>
            </div>

            {/* Mensaje motivacional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 p-4 bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/30"
            >
              <p className="text-center text-gray-300 text-sm">
                {points > 3000 
                  ? "¡Increíble desempeño! Eres un maestro de la trivia." 
                  : points > 2000 
                  ? "¡Gran trabajo! Tu conocimiento es impresionante."
                  : points > 1000
                  ? "¡Buen resultado! Sigue practicando para mejorar."
                  : "¡Buen comienzo! Cada partida te hace mejor."}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para las tarjetas de estadísticas
const StatCard = ({ icon, label, value, subValue, delay, gradient }) => (
  <motion.div 
    initial={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm p-5 rounded-2xl border border-gray-700/50 shadow-lg flex items-center gap-4 hover:border-gray-600/50 transition-all"
  >
    <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} bg-opacity-10 border border-gray-700/30`}>
      {icon}
    </div>
    <div className="flex-1">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-white">{value}</span>
        {subValue && (
          <span className="text-xs text-gray-400">{subValue}</span>
        )}
      </div>
    </div>
  </motion.div>
);

export default ResultsView;