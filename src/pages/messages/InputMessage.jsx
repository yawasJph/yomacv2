import { memo, useCallback, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export const InputMessage = memo(
  ({ input, setInput, onSubmit, sendTypingSignal }) => {
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
        if (!input.trim()) return;
        onSubmit();
        // Resetear altura después de enviar
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      },
      [onSubmit, input],
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
            className="relative flex flex-col gap-2 p-2 bg-neutral-900/90 border-neutral-800 backdrop-blur-xl rounded-[1.8rem] border shadow-2xl transition-all duration-300 dark:bg-gray-800/90 focus-within:border-indigo-500/50 dark:border-gray-700/50 dark:focus-within:border-indigo-500/50"
          >
            <div className="px-4 pt-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value.slice(0, MAX_CHARS));
                  sendTypingSignal();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Escribe algo ..."
                rows={1}
                className="w-full bg-transparent text-white focus:outline-none text-sm md:text-base font-medium placeholder:text-gray-500 resize-none max-h-[250px] custom-scrollbar leading-relaxed"
              />
            </div>

            {/* Barra de Herramientas */}
            <div className="flex items-center justify-between px-3 py-2 mt-1 border-t border-neutral-800/50">
              <span
                className={`text-[10px] font-bold tracking-tight px-2 ${
                  input.length >= MAX_CHARS
                    ? "text-red-500"
                    : "text-neutral-500"
                }`}
              >
                {input.length} / {MAX_CHARS}
              </span>

              <div className="flex flex-end items-center gap-3">
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex items-center justify-center rounded-full text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:grayscale shrink-0 shadow-lg shadow-indigo-500/20 bg-linear-to-r from-indigo-500 via-indigo-600 to-indigo-700 dark:from-indigo-400 
                  dark:via-indigo-500 dark:to-indigo-600 w-8 h-8 md:w-10 md:h-10 disabled:cursor-not-allowed dark:shadow-indigo-500/40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </footer>
    );
  },
);
