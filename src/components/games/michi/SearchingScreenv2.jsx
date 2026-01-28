import { ArrowLeft, Swords, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import useSound from 'use-sound';
import { useAudio } from '../../../context/AudioContext';


const SearchingScreen = ({ onBack }) => {
  const [seconds, setSeconds] = useState(0);
  const { playWithCheck } = useAudio();
  
  // Sonido de pulso/radar
  const [playPulse] = useSound("/sounds/countdown.mp3", { 
    volume: 0.2, 
    playbackRate: 1.5 
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
      // Hacemos un "ping" sonoro cada 2 segundos
      //if (seconds % 2 === 0) playWithCheck(playPulse);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, playPulse, playWithCheck]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center pt-20  relative overflow-hidden"
    >{/* */}
      {/* --- EFECTO RADAR/SONAR --- */}
      <div className="absolute flex items-center justify-center">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute border border-emerald-500/20 rounded-full"
            initial={{ width: 80, height: 80, opacity: 0.8 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: ring,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center mb-10">
          {/* Círculo de fondo con resplandor */}
          <div className="absolute w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
          
          <div className="relative w-24 h-24 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
            {/* Borde circular giratorio */}
            <motion.div
              className="absolute inset-0 rounded-full border-t-4 border-emerald-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Swords size={40} className="text-emerald-500" />
            </motion.div>
          </div>
        </div>

        {/* Texto y Timer */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black uppercase tracking-[0.3em] dark:text-white mb-2">
            Buscando<span className="text-emerald-500">...</span>
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-gray-500 font-mono text-sm">
            <Timer size={14} className="animate-spin-slow" />
            <span>Tiempo en cola: {seconds}s</span>
          </div>
        </div>

        {/* Botón de Cancelar */}
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-gray-200 dark:border-neutral-800 transition-all"
        >
          <ArrowLeft size={18} className="text-gray-400 group-hover:text-red-500" />
          <span className="font-black text-xs uppercase tracking-widest text-gray-500 group-hover:text-red-500">
            Cancelar Match
          </span>
        </motion.button>

        {/* Pequeños tips que cambian */}
        <p className="mt-10 text-[10px] text-gray-400 uppercase font-bold tracking-tighter opacity-50 mb-5">
          Tip: El primero en alinear 3 símbolos gana la partida.
        </p>
      </div>
    </motion.div>
  );
};

export default SearchingScreen;