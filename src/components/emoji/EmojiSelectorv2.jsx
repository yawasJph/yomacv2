import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { Smile, X, Loader2 } from "lucide-react";

// 1. Carga perezosa del componente pesado
const EmojiPickerLazy = React.lazy(() => import("emoji-picker-react"));

export default function EmojiSelector({ addEmoji }) {
  const [showPicker, setShowPicker] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // 2. Memorizar la función para no romper optimizaciones del hijo
  const handleEmojiClick = useCallback((emojiData) => {
    addEmoji(emojiData);
  }, [addEmoji]);

  // 3. Memorizar el estilo/configuración para evitar re-calculos
  const pickerConfig = useMemo(() => ({
    theme: isDark ? "dark" : "light",
    searchPlaceholder: "Buscar emoji...",
    previewConfig: { showPreview: false },
    skinTonesDisabled: true,
    lazyLoadEmojis: true, // Optimización nativa de la librería
    width: "100%",
    height: "390px",
    autoFocusSearch: false
  }), [isDark]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(prev => !prev)}
         className={`p-2 rounded-full transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
          showPicker 
            ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
            : "text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
        }`}
      >
        <Smile size={20} />
      </button>

      {showPicker && (
        <>
          <div 
            className="fixed inset-0 z-60 bg-black/20 sm:bg-transparent"
            onClick={() => setShowPicker(false)}
          />

          <div className="fixed inset-x-0 bottom-0 z-200 sm:absolute sm:bottom-auto sm:top-full sm:left-0 sm:w-[350px] animate-in slide-in-from-bottom duration-200">
            <div className="bg-white dark:bg-[#151719] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border dark:border-neutral-800">
              
              {/* Header en móvil */}
              <div className="flex items-center justify-between p-3 border-b dark:border-neutral-800 sm:hidden">
                <span className="text-sm font-bold dark:text-white">Emojis</span>
                <button onClick={() => setShowPicker(false)}><X size={18} /></button>
              </div>

              {/* 4. Suspense para manejar la carga del componente pesado */}
              <Suspense fallback={
                <div className="h-[400px] w-full flex items-center justify-center bg-white dark:bg-neutral-900">
                  <Loader2 className="animate-spin text-emerald-500" />
                </div>
              }>
                <EmojiPickerLazy
                  onEmojiClick={handleEmojiClick}
                  {...pickerConfig}
                />
              </Suspense>
            </div>
          </div>
        </>
      )}
    </div>
  );
}