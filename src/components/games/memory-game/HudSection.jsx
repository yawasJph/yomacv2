import { Hash, Star, Timer } from "lucide-react";
import { memo } from "react";

const HudSection = memo(({ seconds, moves }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-3 sm:mb-8">
      <div
        className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-2xl border-2 border-blue-100 dark:border-blue-800/30 
                transition-all flex flex-col items-center"
      >
        <Timer
          className="text-blue-500 dark:text-blue-400  mb-0.5 sm:mb-1"
          size={18}
        />
        <span className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
          Tiempo
        </span>
        <span className="text-xl sm:text-2xl font-black dark:text-white tabular-nums">
          {seconds}s
        </span>
      </div>
      <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-2xl border-2 border-purple-100 dark:border-purple-800/30 transition-all flex flex-col items-center ">
        <Hash
          className="text-purple-600 dark:text-purple-400 mb-0.5 sm:mb-1"
          size={18}
        />
        <span className="block text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider ">
          Pasos
        </span>
        <span className="text-xl sm:text-2xl font-black dark:text-white tabular-nums">
          {moves}
        </span>
      </div>
      <div className="bg-linear-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 p-5 rounded-2xl border-2 border-yellow-200 dark:border-yellow-700/30 transition-all flex flex-col items-center">
        <Star
          className="block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider "
          size={18}
        />
        <span className="block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider mb-1">
          Puntos
        </span>
        <span className="text-base sm:text-lg font-black dark:text-white tabular-nums">
          {Math.max(0, 1000 - moves * 10 - seconds * 2)}
        </span>
      </div>
    </div>
  );
});

export default HudSection;
