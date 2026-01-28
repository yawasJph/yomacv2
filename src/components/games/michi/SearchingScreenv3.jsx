import { ArrowLeft, Swords, Timer, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import useSound from 'use-sound';
import { useAudio } from '../../../context/AudioContext';

const GAME_TIPS = [
  "El centro es la posición más fuerte en el Michi.",
  "¡Gana 300 puntos por cada victoria online!",
  "Si tu rival se desconecta, la victoria es tuya.",
  "El modo IA tiene 3 niveles de dificultad ocultos.",
  "Puedes silenciar la música en la esquina superior.",
  "Los empates también te otorgan créditos de consolación.",
  "¡Invita a tus amigos a jugar el duelo local!"
];

const SearchingScreen = ({ onBack }) => {
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const { playWithCheck } = useAudio();
  
  const [playPulse] = useSound("/sounds/countdown.mp3", { 
    volume: 0.2, 
    playbackRate: 1.5 
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        // Rotar tip cada 5 segundos
        if ((prev + 1) % 5 === 0) {
          setTipIndex(curr => (curr + 1) % GAME_TIPS.length);
        }
        
        // Ping sonoro cada 2 segundos
        //if ((prev + 1) % 2 === 0) playWithCheck(playPulse);
        
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playPulse, playWithCheck]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[65vh] p-6 relative overflow-hidden"
    >
      {/* --- EFECTO RADAR --- */}
      <div className="absolute flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute border border-emerald-500/10 rounded-full"
            initial={{ width: 80, height: 80, opacity: 0.8 }}
            animate={{ width: 500, height: 500, opacity: 0 }}
            transition={{ duration: 4, repeat: Infinity, delay: ring * 1.2, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Icono Central Animado */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-10">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-full"
            />
            <Swords size={48} className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
        </div>

        {/* Status y Timer */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-black uppercase tracking-[0.2em] dark:text-white">
            Buscando Rival
          </h2>
          <div className="flex items-center justify-center gap-2 text-emerald-500/60 font-mono text-xs mt-1">
            <Timer size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
            <span>{seconds}s en cola</span>
          </div>
        </div>

        {/* SECCIÓN DE TIPS DINÁMICOS */}
        <div className="h-16 w-full flex flex-col items-center justify-center mb-10 px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Lightbulb size={14} fill="currentColor" className="opacity-80" />
                <span className="text-[10px] font-black uppercase tracking-widest">Tip Pro</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic leading-snug">
                "{GAME_TIPS[tipIndex]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Botón Salir */}
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 transition-colors group hover:border-red-500/50"
        >
          <ArrowLeft size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
          <span className="font-bold text-xs uppercase tracking-widest text-gray-500 group-hover:text-red-500 transition-colors">
            Cancelar Búsqueda
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SearchingScreen;