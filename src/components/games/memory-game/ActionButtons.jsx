import { ArrowLeft, RefreshCcw } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../../hooks/useIsMobile";

const ActionButtons = ({resetGame}) => {
    const navigate = useNavigate()
    const isMobile = useIsMobile()
  return (
    <div className="mt-6 gap-3 flex justify-center sm:mt-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-500 transition-all active:scale-95 shadow-sm"
      >
        <ArrowLeft size={18} /> Volver {!isMobile && "Al Arcade"}
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
