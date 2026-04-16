import React from "react";

export const Divider = {
  Single: () => (
    <div className="relative my-10">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200 dark:border-gray-800" />
      </div>

      <div className="relative flex justify-center">
        <span
          className="px-4 py-1 text-xs font-black tracking-widest uppercase rounded-full 
        bg-white dark:bg-black text-gray-500 dark:text-gray-400 
        border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          Próximamente 🚀
        </span>
      </div>
    </div>
  ),

  Gamer: () => (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />

      <span className="text-xs font-black tracking-widest uppercase text-emerald-500">
        Próximos desafíos
      </span>

      <div className="flex-1 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
    </div>
  ),

  Pro: () => (
    <div className="flex items-center gap-3 my-10 justify-center">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />

      <div
        className="flex items-center gap-2 px-4 py-1 rounded-full 
      bg-linear-to-r from-emerald-500/10 to-yellow-400/10 
      border border-gray-200 dark:border-gray-800"
      >
        <span className="text-sm">🧠</span>
        <span className="text-xs font-black tracking-widest uppercase text-gray-600 dark:text-gray-300">
          Nuevos Desafíos
        </span>
      </div>

      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
    </div>
  ),
};
