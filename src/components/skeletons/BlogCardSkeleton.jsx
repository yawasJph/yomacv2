import React from "react";

export const BlogCardSkeleton = () => {
  return (
    <article className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl overflow-hidden animate-pulse">
      {/* Banner */}
      <div>
         
        <div className="skeleton relative aspect-video bg-zinc-200 dark:bg-zinc-800">
          {/* Badge reading time */}
          <div className="skeleton absolute top-3/4 left-3 h-5 w-16 rounded-lg bg-zinc-300/80 dark:bg-zinc-700/80" />
        </div>
       
      </div>

      {/* Info */}
      <div className="p-5">
        {/* Fecha */}
        <div className="skeleton h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />

        {/* Title */}
        <div className="space-y-2 mb-3">
          <div className="skeleton h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="skeleton h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
        </div>

        {/* Excerpt */}
        <div className="space-y-2 mb-4">
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
          <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Autor */}
          <div className="flex items-center gap-2">
            <div className="skeleton w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="skeleton h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>

          {/* CTA */}
          <div className="skeleton h-4 w-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </article>
  );
};
