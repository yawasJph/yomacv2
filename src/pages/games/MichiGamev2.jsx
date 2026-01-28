import React, { useEffect, useState, useCallback, useMemo, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Cpu, ArrowLeft, Users, VolumeX, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useAudio } from "../../context/AudioContext";
import useSound from "use-sound";

// 1. LAZY LOADING: Solo se cargan cuando se necesitan
const MichiBoard = lazy(() => import("./MichiBoardv2"));
const MichiPVP = lazy(() => import("./MichiPVP"));
const MichiOnline = lazy(() => import("./MichiOnline3"));

const MichiGame = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { isMuted, setIsMuted, playWithCheck } = useAudio();

  const [play, { stop }] = useSound(`/sounds/bgv5.mp3`, {
    volume: 0.7,
    loop: true,
  });

  // 2. USECALLBACK: Evita recrear la función en cada render
  const handleBack = useCallback(() => {
    setGameMode(null);
    playWithCheck(play);
  }, [play, playWithCheck]);

  useEffect(() => {
    if (!gameMode && !isMuted) {
      play();
    } else {
      stop();
    }
    return () => stop();
  }, [gameMode, isMuted, play, stop]);

  // 3. USEMEMO: El botón solo se recalcula si estas variables cambian
  const SoundToggleButton = useMemo(() => (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setIsMuted(!isMuted)}
      className={`absolute ${
        gameMode === "online" && isMobile ? "-bottom-4" : isMobile ? "bottom-2" : "top-10"
      } right-13 z-50 p-3 rounded-2xl transition-all shadow-lg ${
        isMuted ? "bg-red-500 text-white" : "bg-white dark:bg-neutral-900 text-purple-500 border border-purple-500/20"
      }`}
    >
      {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} className="animate-pulse" />}
    </motion.button>
  ), [isMuted, isMobile, gameMode, setIsMuted]);

  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-black md:pt-10 relative">
        {SoundToggleButton}
        <HeaderSection />
        <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
          <MenuButton onClick={() => setGameMode("ia")} icon={<Cpu className="text-purple-500" />} title="Contra la IA" subtitle="Modo Experto" />
          <MenuButton onClick={() => setGameMode("pvp")} icon={<Users className="text-blue-500" />} title="Duelo Local" subtitle="2 Jugadores" />
          <MenuButton onClick={() => setGameMode("online")} icon={<Users className="text-indigo-500" />} title="Duelo Online" subtitle="Multiplayer" />
          <button onClick={() => navigate("/games")} className="mt-4 text-gray-400 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:underline">
            <ArrowLeft size={14} /> Volver al Arcade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      {SoundToggleButton}
      
      {/* 4. SUSPENSE: Muestra algo mientras el Lazy Loading carga el componente */}
      <Suspense fallback={<div className="text-purple-500 animate-bounce">Cargando modo...</div>}>
        {gameMode === "ia" && <MichiBoard onBack={handleBack} />}
        {gameMode === "pvp" && <MichiPVP onBack={handleBack} />}
        {gameMode === "online" && <MichiOnline user={user} onBack={handleBack} stop={stop} onPlayVSIA={()=> setGameMode("ia")}/>}
      </Suspense>

      <p className={`dark:text-white font-bold ${gameMode === "online" ? "pt-3" : ""}`}>
        Modo: {gameMode.toUpperCase()}
      </p>
      
      {gameMode !== "online" && (
        <button onClick={handleBack} className="text-emerald-500 mt-4 underline">
          Cambiar modo
        </button>
      )}
    </div>
  );
};

// Componentes pequeños extraídos para limpieza (Mejor legibilidad)
const HeaderSection = React.memo(() => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
    <h1 className="text-5xl font-black italic text-purple-500 mb-2">MICHI PRO</h1>
    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Selecciona tu desafío</p>
  </motion.div>
));

const MenuButton = React.memo(({ onClick, icon, title, subtitle }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="bg-gray-50 dark:bg-neutral-900 p-6 rounded-4xl border-2 border-transparent hover:border-emerald-500 transition-all flex items-center gap-4 text-left shadow-xl shadow-black/5"
  >
    <div className="bg-white dark:bg-black p-3 rounded-2xl shadow-inner">{icon}</div>
    <div>
      <h3 className="font-black dark:text-white text-lg leading-none">{title}</h3>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">{subtitle}</p>
    </div>
  </motion.button>
));

export default MichiGame;