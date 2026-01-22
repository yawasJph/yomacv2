import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Send, Camera, ImagePlus } from "lucide-react";

const MAX_CHARS = 500;
const MAX_TEXTAREA_HEIGHT = 160; // px (~6 líneas)

const ChatInputMobile = memo(
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
    const handleSubmit = useCallback(
      (e) => {
        e.preventDefault();
        onSubmit();
      },
      [onSubmit],
    );
    
    const textareaRef = useRef(null);

    // 🔥 SOLO el textarea crece (el contenedor NO)
    useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;

      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT) + "px";
    }, [input]);

    

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    };

    return (
      <footer className="p-4 md:p-6 bg-linear-to-t sticky bottom-0 z-40 from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col p-2 bg-neutral-900/80 border-neutral-800 backdrop-blur-xl rounded-[2.5rem] border shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 dark:bg-gray-800/80 focus-within:border-yellow-400 dark:border-gray-700/50 shadow-gray-200/50 dark:shadow-gray-900/30 dark:focus-within:border-yellow-500 focus-within:shadow-yellow-100 dark:focus-within:shadow-yellow-900/20"
        >
          {/* WRAPPER DEL TEXTAREA (este es el truco) */}
          <div className="overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) =>
                e.target.value.length <= MAX_CHARS && setInput(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Habla, ¿qué andamos haciendo?"
              rows={1}
              maxLength={MAX_CHARS}
              className="
              w-full resize-none bg-transparent
              text-white py-3 px-4
              focus:outline-none
              text-sm md:text-base font-medium
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              overflow-y-auto
              min-h-12 max-h-[150px]
            "
              style={{ scrollbarWidth: "thin" }}
            />
          </div>

          {/* Contenedor para botones alineados */}
          <div className="flex items-center justify-between mt-2 px-2">
            <button
              type="button"
              onClick={onFileChange}
              className="flex items-center justify-center cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-yellow-500 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all shrink-0"
            >
              <Camera size={22} />
            </button>

            <div className="flex items-center gap-2">
              {input.length > 0 && (
                <span className="text-xs text-gray-400">
                  {input.length}/{MAX_CHARS}
                </span>
              )}
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex items-center justify-center rounded-full text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:grayscale shrink-0 shadow-lg shadow-yellow-500/20 bg-linear-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 w-10 h-10 md:w-12 md:h-12 disabled:cursor-not-allowed dark:shadow-yellow-500/40"
              >
                <Send size={20} className="ml-0.5" />
              </button>
            </div>
          </div>
        </form>
        <p className="text-[8px] text-center text-neutral-700 mt-4 font-bold uppercase tracking-[0.3em]">
          Yawas v4.0 • Inteligencia Estudiantil
        </p>
      </footer>
    );
  },
);

export default ChatInputMobile;
