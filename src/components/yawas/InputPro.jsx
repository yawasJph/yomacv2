import { memo, useCallback, useRef, useEffect } from "react";
import { Send, Camera, X } from "lucide-react";

export const ChatInput2 = memo(
  ({
    input,
    setInput,
    imageFile,
    previewUrl,
    isTyping,
    onFileChange,
    onRemoveImage,
    onSubmit,
  }) => {
    const textareaRef = useRef(null);
    const MAX_CHARS = 500; // Límite para cuidar tus tokens

    // Lógica para auto-ajustar la altura
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Máximo 200px de alto
      }
    }, [input]);

    const handleSubmit = useCallback(
      (e) => {
        if (e) e.preventDefault();
        if (!input.trim() && !imageFile) return;
        onSubmit();
        // Resetear altura después de enviar
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      },
      [onSubmit, input, imageFile]
    );

    // Manejar Enter para enviar y Shift+Enter para salto de línea
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <footer className="p-4 md:p-6 bg-linear-to-t sticky bottom-0 z-40 from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent">
        <div className="max-w-4xl mx-auto w-full">
          <form
            onSubmit={handleSubmit}
            className="relative flex flex-col gap-2 p-2 bg-neutral-900/90 border-neutral-800 backdrop-blur-xl rounded-[1.8rem] border shadow-2xl transition-all duration-300 dark:bg-gray-800/90 focus-within:border-yellow-500/50 dark:border-gray-700/50 dark:focus-within:border-yellow-500/50"
          >
            {/* Preview de Imagen */}
            {previewUrl && (
              <div className="absolute -top-32 left-4 p-2 rounded-2xl border bg-neutral-800 border-neutral-700 shadow-2xl animate-in slide-in-from-bottom-4 z-50">
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-xl border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="px-4 pt-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                placeholder="Escribe algo a Yawas..."
                rows={1}
                className="w-full bg-transparent text-white focus:outline-none text-sm md:text-base font-medium placeholder:text-gray-500 resize-none max-h-[250px] custom-scrollbar leading-relaxed"
              />
            </div>

            {/* Barra de Herramientas (Abajo) */}
            <div className="flex items-center justify-between px-3 py-2 mt-1 border-t border-neutral-800/50">
              <div className="flex items-center gap-2">
                {/* Botón Cámara abajo a la izquierda */}
                <label className="flex items-center justify-center cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-yellow-500 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all shrink-0">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onFileChange}
                  />
                  <Camera size={20} />
                </label>

                {/* Contador de caracteres */}
                <span className={`text-[10px] font-bold tracking-tight px-2 ${input.length >= MAX_CHARS ? 'text-red-500' : 'text-neutral-500'}`}>
                  {input.length} / {MAX_CHARS}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {isTyping && (
                  <span className="text-[9px] text-yellow-500 animate-pulse font-bold uppercase tracking-widest hidden sm:block">
                    Pensando...
                  </span>
                )}
                
                {/* Botón Enviar abajo a la derecha */}
                <button
                  type="submit"
                  disabled={isTyping || (!input.trim() && !imageFile)}
                  className="flex items-center justify-center rounded-full text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:grayscale shrink-0 shadow-lg shadow-yellow-500/20 bg-linear-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 w-8 h-8 md:w-10 md:h-10 disabled:cursor-not-allowed dark:shadow-yellow-500/40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>

          <p className="text-[8px] text-center text-neutral-500 mt-4 font-bold uppercase tracking-[0.3em] opacity-50">
            Yawas v4.0 • Sistema de Inteligencia Resiliente
          </p>
        </div>
      </footer>
    );
  }
);