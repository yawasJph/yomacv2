import { memo } from "react";
import { Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ChatHeader = memo(({ isMobile }) => {
  const navigate = useNavigate();

  return (
    <header
      className={`flex items-center gap-5 p-4 md:p-6 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl z-40 border-b border-gray-100 dark:border-neutral-900 ${
        isMobile && "sticky top-16 z-10 px-3"
      } bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-gray-900/30 transition-all`}
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center w-10 h-10 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-95"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <div className="p-2.5 rounded-2xl bg-linear-to-br from-yellow-400 to-orange-500 dark:from-yellow-400 dark:to-orange-500 shadow-lg shadow-yellow-500/20 dark:shadow-emerald-500/30 animate-pulse-subtle">
            <Zap size={22} className="text-black fill-black" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 dark:bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight bg-linear-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              YAWAS
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
});