import React from "react";

export const BlogDetailSkeleton = () => {
  return (
    <article className="bg-white dark:bg-zinc-950 pb-20 relative animate-pulse">
      {/* Botón Atrás */}
      <div className="absolute top-6 left-6 z-30">
        <div className="skeleton flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 w-20 h-10" />
      </div>

      <header className="max-w-4xl mx-auto pt-16 px-6">
        {/* TITLE */}
        <div className="space-y-4 mb-10 text-center">
          <div className="skeleton h-8 md:h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mx-auto" />
          <div className="skeleton h-8 md:h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mx-auto" />
        </div>

        {/* AUTHOR */}
        <div className="flex items-center justify-center gap-4 mb-10 border-y border-zinc-100 dark:border-zinc-800 py-6">
          <div className="skeleton w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />

          <div className="flex flex-col gap-2">
            <div className="skeleton h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="skeleton h-3 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>

        {/* BANNER */}
        <div className="skeleton w-full aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-3xl mb-12" />
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-12 w-full">
        {/* CONTENT (simulación tipo texto largo) */}
        <div className="space-y-4">
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/6" />
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
        </div>

        {/* BOTONES */}
        <div className="flex gap-6 pt-3 mt-6">
          <div className="skeleton h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>

        {/* FOOTER AUTOR */}
        <div className="mt-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="skeleton w-24 h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />

          {/* Info */}
          <div className="flex-1 w-full space-y-3 text-center md:text-left">
            <div className="skeleton h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto md:mx-0" />
            <div className="skeleton h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto md:mx-0" />
            <div className="skeleton h-4 w-56 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto md:mx-0" />

            {/* CTA */}
            <div className="skeleton h-7 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg mx-auto md:mx-0 mt-4" />
          </div>
        </div>
      </div>
    </article>
  );
};