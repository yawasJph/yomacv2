import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, ArrowLeft, Users, VolumeX, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MichiBoard from "./MichiBoard";
import MichiPVP from "./MichiPVP";
//import MichiOnline from "./MichiOnline";
import { useAuth } from "../../context/AuthContext";
import MichiOnline from "./MichiOnline2";
import useSound from "use-sound";
import { useIsMobile } from "../../hooks/useIsMobile";

const MichiGame = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState(null); // null, 'ia', 'pvp'
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const isMobile = useIsMobile()

  const trackPath = `/sounds/bgv5.mp3`;
  // 2. Configuramos useSound para música de fondo
  const [play, { stop, sound }] = useSound(trackPath, {
    volume: 0.5, // Volumen bajo para que no aturda
    interrupt: true, // Interrumpe otros sonidos si fuera necesario
    loop: true, // ¡Importante! Para que la música no se corte
  });
  // 3. Control maestro de la música (Play/Stop/Mute)
  useEffect(() => {
    if (!isMuted) {
      play();
    } else {
      stop();
    }

    // Cleanup: Detener la música cuando el usuario salga del GameCenter
    return () => stop();
  }, [isMuted, play, stop]);

  // Botón de sonido reutilizable
  const SoundToggle = (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setIsMuted(!isMuted)}
      className={`absolute ${isMobile ? "bottom-0": "top-10"} right-13 z-50 p-3 rounded-2xl transition-all shadow-lg ${
        isMuted 
          ? "bg-red-500 text-white" 
          : "bg-white dark:bg-neutral-900 text-purple-500 border border-purple-500/20"
      }`}
    >
      {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} className="animate-pulse" />}
    </motion.button>
  );  

  // Pantalla de Selección Inicial
  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-black md:pt-10 relative">
        {SoundToggle} {/* <-- BOTÓN AQUÍ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-black italic text-purple-500 mb-2">
            MICHI PRO
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Selecciona tu desafío
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-xs ">
          <MenuButton
            onClick={() => setGameMode("ia")}
            icon={<Cpu className="text-purple-500" />}
            title="Contra la IA"
            subtitle="Modo Experto"
          />
          <MenuButton
            onClick={() => setGameMode("pvp")}
            icon={<Users className="text-blue-500" />}
            title="Duelo Local"
            subtitle="2 Jugadores"
          />
          <MenuButton
            onClick={() => setGameMode("online")}
            icon={<Users className="text-indigo-500" />}
            title="Duelo Online"
            subtitle="2 Jugadores"
          />
          <button
            onClick={() => navigate("/games")}
            className="mt-4 text-gray-400 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:underline"
          >
            <ArrowLeft size={14} /> Volver al Arcade
          </button>
        </div>
      </div>
    );
  }

  // Aquí iría el Tablero (que desarrollaremos a continuación)
  return (
    <div className="flex flex-col items-center justify-center">
      {SoundToggle} {/* <-- BOTÓN AQUÍ */}
      {/* Tablero de Michi... */}
      {gameMode === "ia" && <MichiBoard onBack={() => setGameMode(null)} />}
      {gameMode === "pvp" && <MichiPVP onBack={() => setGameMode(null)} />}
      {gameMode === "online" && (
        <MichiOnline user={user} onBack={() => setGameMode(null)} />
      )}
      <p className="dark:text-white font-bold">
        Modo: {gameMode.toUpperCase()}
      </p>
      {gameMode != "online" && (
        <button
          onClick={() => setGameMode(null)}
          className="text-emerald-500 mt-4 underline"
        >
          Cambiar modo
        </button>
      )}
    </div>
  );
};

// Componente auxiliar para el menú
const MenuButton = ({ onClick, icon, title, subtitle }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="bg-gray-50 dark:bg-neutral-900 p-6 rounded-4xl border-2 border-transparent hover:border-emerald-500 transition-all flex items-center gap-4 text-left shadow-xl shadow-black/5"
  >
    <div className="bg-white dark:bg-black p-3 rounded-2xl shadow-inner">
      {icon}
    </div>
    <div>
      <h3 className="font-black dark:text-white text-lg leading-none">
        {title}
      </h3>
      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
        {subtitle}
      </p>
    </div>
  </motion.button>
);

export default MichiGame;
