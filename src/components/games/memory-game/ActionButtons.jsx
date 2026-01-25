import { ArrowLeft, RefreshCcw, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../../hooks/useIsMobile";

const ActionButtons = ({resetGame, isMuted, setIsMuted}) => {
    const navigate = useNavigate()
    const isMobile = useIsMobile()
  return (
    <div className="mt-6 gap-3 flex justify-between sm:mt-8">
      
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-500 transition-all active:scale-95 shadow-sm"
      >
        <ArrowLeft size={18} /> Volver {!isMobile && "Al Arcade"}
      </button>
      <button
        onClick={() => setIsMuted(!isMuted)}
        className={`p-3 sm:p-4 rounded-xl transition-colors ${
          isMuted
            ? "text-red-500 bg-red-50 dark:bg-red-500/10"
            : "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
        }`}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      <button
        onClick={resetGame}
        className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-500 transition-all active:scale-95 shadow-sm"
      >
        <RefreshCcw size={18} /> Reiniciar {!isMobile && "Desafío"}
      </button>
      
    </div>
  );
};

export default ActionButtons;
