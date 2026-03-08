export const MutualsSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="w-full flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 animate-pulse"
        >
          {/* Avatar Skeleton */}
          <div className="skeleton w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          
          <div className="flex-1 space-y-3">
            <div className="flex justify-between">
              {/* Nombre */}
              <div className="skeleton h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              {/* Hora */}
              <div className="skeleton h-3 w-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
            </div>
            {/* Último mensaje */}
            <div className="skeleton h-3 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};