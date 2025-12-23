import React from "react";

const SuggestionSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-3 animate-pulse">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded w-1/2" />
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800" />
    </div>
  );
};

export default SuggestionSkeleton;
