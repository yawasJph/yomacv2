import React from "react";

export const MyBlogCardSkeleton = () => {
  return (
    <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
      
      {/* LEFT */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        
        {/* TITLE + STATUS */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Title lines */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            <div className="skeleton h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
          </div>

          {/* Status badge */}
          <div className="skeleton h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0" />
        </div>

        {/* META */}
        <div className="skeleton h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
        <div className="skeleton w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="skeleton w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="skeleton w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
};