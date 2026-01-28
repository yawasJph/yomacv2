import { ArrowLeft, Swords, Timer, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, memo } from 'react';
import useSound from 'use-sound';
import { useAudio } from '../../../context/AudioContext';

const GAME_TIPS = [
  "El centro es la posición más fuerte en el Michi.",
  "¡Gana 300 puntos por cada victoria online!",
  "Si tu rival se desconecta, la victoria es tuya.",
  "El modo IA tiene 3 niveles de dificultad ocultos.",
  "Puedes silenciar la música y el sonido clickeando el audio.",
  "Los empates también te otorgan créditos de consolación.",
  "¡Invita a tus amigos a jugar el duelo local!",
  "Mientras mas duelos ganas más alto estaras en el ranking."
];

// 1. SUBCOMPONENTE PARA EL TIMER: Evita re-renderizar todo el radar cada segundo
const SearchTimer = memo(() => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-emerald-500/60 font-mono text-xs mt-1">
      <Timer size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
      <span>{seconds}s en cola</span>
    </div>
  );
});

const SearchingScreen = ({ onBack , onPlayVSIA}) => {
  const { playWithCheck } = useAudio();
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [showSuggestion, setShowSuggestion] = useState(false);
  
  const [playPulse] = useSound("/sounds/countdown.mp3", { 
    volume: 0.2, 
    playbackRate: 1.5 
  });

  // 2. INTERVALO EXCLUSIVO PARA TIPS: Más limpio y eficiente
 useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        const next = prev + 1;
        
        // Lógica de Tips
        if (next % 5 === 0) setTipIndex(curr => (curr + 1) % GAME_TIPS.length);
        
        // Lógica de Sugerencia: Si llega a 30s, activamos el aviso
        if (next >= 30 && !showSuggestion) setShowSuggestion(true);
        
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showSuggestion]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[65vh] p-6 relative overflow-hidden"
    >
      {/* Radar: Ahora no se re-renderiza cada segundo */}
      <RadarEffect />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        <CentralIcon />

        <div className="text-center mb-8">
          <h2 className="text-xl font-black uppercase tracking-[0.2em] dark:text-white">
            Buscando Rival
          </h2>
          <SearchTimer />
        </div>

        {/* Sección de Tips con AnimatePresence */}
        {/* <div className="h-16 w-full flex flex-col items-center justify-center mb-10 px-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
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
        </div> */}
        {/* --- NUEVA SECCIÓN DE SUGERENCIA --- */}
        <div className="h-24 w-full flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            {!showSuggestion ? (
              <TipDisplay index={tipIndex} />
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-2xl w-full text-center"
              >
                <p className="text-[10px] font-black text-purple-400 uppercase mb-2 tracking-tighter">
                  ¿Demasiada espera?
                </p>
                <button 
                  onClick={onPlayVSIA} // Esta función llevaría al MichiBoard normal
                  className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold py-2 px-4 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-purple-900/20"
                >
                  Retar a la IA Imbatible
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

// Subcomponentes estáticos memorizados para evitar cualquier re-render
const RadarEffect = memo(() => (
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
));

// Componente pequeño para los tips para no ensuciar el principal
const TipDisplay = memo(({ index }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex flex-col items-center text-center px-4"
  >
    <div className="flex items-center gap-2 text-amber-400 mb-1">
      <Lightbulb size={14} fill="currentColor" />
      <span className="text-[10px] font-black uppercase">Tip Pro</span>
    </div>
    <p className="text-sm text-gray-400 italic">"{GAME_TIPS[index]}"</p>
  </motion.div>
));

const CentralIcon = memo(() => (
  <div className="relative w-28 h-28 flex items-center justify-center mb-10">
    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-full"
    />
    <Swords size={48} className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
  </div>
));

export default memo(SearchingScreen);