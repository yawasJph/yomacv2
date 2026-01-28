import { ArrowLeft, RefreshCcw, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { memo } from "react";
import { motion } from "framer-motion";

// 1. Centralizamos los estilos repetidos
const BUTTON_BASE = "flex items-center gap-2 px-6 sm:px-8 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-500 transition-all active:scale-95 shadow-sm";

const ActionButtons = memo(({ resetGame, isMuted, setIsMuted }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Botón de sonido reutilizable
  const SoundToggle = (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setIsMuted(!isMuted)}
      className={`p-3 rounded-2xl transition-all shadow-lg ${
        isMuted
          ? "bg-gray-500/50 text-white"
          : "bg-white dark:bg-neutral-900 text-emerald-500 border border-emerald-500/20"
      }`}
    >
      {isMuted ? (
        <VolumeX size={24} />
      ) : (
        <Volume2 size={24} className="animate-pulse" />
      )}
    </motion.button>
  );

  return (
    <div className="mt-6 gap-3 flex justify-between sm:mt-8">
      
      {/* Botón Volver */}
      <button 
        onClick={() => navigate(-1)} 
        className={BUTTON_BASE}
      >
        <ArrowLeft size={18} /> 
        <span>Volver {!isMobile && "Al Arcade"}</span>
      </button>

      {/* Botón Mute - Estilo dinámico extraído para legibilidad */}
      {/* <button
        onClick={() => setIsMuted(!isMuted)}
        className={`p-3 sm:p-4 rounded-xl transition-colors ${
          isMuted
            ? "text-red-500 bg-red-50 dark:bg-red-500/10"
            : "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
        }`}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button> */}

      {SoundToggle}
      

      {/* Botón Reiniciar */}
      <button 
        onClick={resetGame} 
        className={BUTTON_BASE}
      >
        <RefreshCcw size={18} /> 
        <span>Reiniciar {!isMobile && "Desafío"}</span>
      </button>
      
    </div>
  );
});

export default ActionButtons;