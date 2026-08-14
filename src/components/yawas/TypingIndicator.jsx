import { memo } from "react";

export const TypingIndicator = memo(() => {
  return (
    <div className="flex justify-start animate-in fade-in duration-300">
      <div className="bg-neutral-900/50 border border-neutral-800/50 p-4 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-sm">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
});