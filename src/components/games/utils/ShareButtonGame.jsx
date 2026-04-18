import { Coins, Loader2, Share2 } from "lucide-react";
import React from "react";

export const ShareButtonGame = ({onShare, onLoading}) => {
  return (
    <button
      onClick={onShare}
      disabled={onLoading}
      className={`
        relative w-full py-3 rounded-xl font-bold
        flex items-center justify-center gap-2
        text-white overflow-hidden
        bg-linear-to-r from-cyan-500 via-indigo-500 to-violet-600
        shadow-lg shadow-indigo-500/30
        transition-all duration-200
        ${
          onLoading
            ? "opacity-70 cursor-not-allowed scale-[0.98] saturate-50"
            : "active:scale-95 hover:brightness-110"
        }
        `}
    >
      {/* Glow animado */}
      <span className="absolute inset-0 bg-white/10 animate-pulse" />

      {onLoading ? (
        <Loader2 size={18} className="animate-spin z-10" />
      ) : (
        <span className="flex items-center gap-2 z-10">
          {/* 💰 Recompensa */}
          <Share2 size={18} />
          Publicar récord
          <span
            className="
            flex items-center gap-1 text-[11px] px-2 py-0.5
            rounded-full bg-black/30 backdrop-blur-sm
            font-black
            "
          >
            <Coins className="text-amber-400" /> +20
          </span>
        </span>
      )}

      {/* Badge */}
      <span
        className="
        absolute top-1 right-3 text-[10px] px-2 py-0.5
        bg-black text-white rounded-full font-black
        animate-pulse
        "
      >
        new
      </span>
    </button>
  );
};
