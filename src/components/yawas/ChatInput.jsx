import { memo, useCallback } from "react";
import { Send, Camera, X } from "lucide-react";

export const ChatInput = memo(
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

    return (
      <footer className="p-4 md:p-6 bg-linear-to-t sticky bottom-0 z-40 from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 p-2 bg-neutral-900/80 border-neutral-800 backdrop-blur-xl rounded-[2.5rem] border shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 dark:bg-gray-800/80 focus-within:border-yellow-400 dark:border-gray-700/50 shadow-gray-200/50 dark:shadow-gray-900/30 dark:focus-within:border-yellow-500 focus-within:shadow-yellow-100 dark:focus-within:shadow-yellow-900/20"
        >
          {previewUrl && (
            <div className="absolute -top-28 left-4 p-2 rounded-3xl border bg-neutral-800 border-neutral-700 shadow-2xl slide-in-from-bottom-4 md:-top-32 dark:bg-gray-800 dark:border-gray-700 animate-in slide-in-from-bottom-4 z-50">
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-2xl border border-white/10 md:h-24 md:w-24 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:scale-110 transition-transform"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
          <label className="flex items-center justify-center cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-yellow-500 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all shrink-0 ml-2">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onFileChange}
            />
            <Camera size={22} />
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Habla, ¿qué andamos haciendo?"
            className="flex-1 bg-transparent text-white py-3 px-2 focus:outline-none text-sm md:text-base font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={isTyping || (!input.trim() && !imageFile)}
            className="flex items-center justify-center rounded-full text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:grayscale shrink-0 shadow-lg shadow-yellow-500/20 bg-linear-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 w-10 h-10 md:w-12 md:h-12 disabled:cursor-not-allowed dark:shadow-yellow-500/40"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </form>
        <p className="text-[8px] text-center text-neutral-700 mt-4 font-bold uppercase tracking-[0.3em]">
          Yawas v4.0 • Inteligencia Estudiantil
        </p>
      </footer>
    );
  },
);
