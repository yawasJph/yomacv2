import { Loader2 } from "lucide-react";

export function UploadLoader({ progress }) {
  if (progress <= 0) return null;

  const getMessage = () => {
    if (progress < 30) return "Subiendo archivos...";
    if (progress < 70) return "Procesando...";
    if (progress < 100) return "Finalizando...";
    return "Completando...";
  };

  return (
    <>
      {/* 🔲 OVERLAY (solo visible en mobile) */}
      <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:hidden">
        
        <div className="w-full bg-white dark:bg-zinc-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom">

          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={22} />
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="font-semibold text-zinc-900 dark:text-white">
              Subiendo publicación
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {progress}% completado
            </p>
          </div>

          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-center text-zinc-400">
            {getMessage()}
          </p>
        </div>
      </div>

      {/* 🖥️ DESKTOP CARD */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-100 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 animate-in fade-in slide-in-from-bottom-2">

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={18} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Subiendo archivos
            </p>
            <p className="text-xs text-zinc-500">
              {progress}% completado
            </p>
          </div>
        </div>

        <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {progress === 100 && (
          <p className="text-xs text-emerald-600 mt-2 text-center">
            Procesando publicación...
          </p>
        )}
      </div>
    </>
  );
}