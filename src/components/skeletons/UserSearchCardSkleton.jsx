export const UserItemSkeleton = ({ isMobile }) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar */}
        <div className="skeleton w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0 animate-pulse" />

        <div className="min-w-0 flex-1 space-y-2">
          {/* Nombre */}
          <div className="skeleton h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />

          {/* Badges y Tags */}
          <div className="flex flex-wrap gap-2">
            <div className="skeleton h-4 w-16 bg-emerald-100/40 dark:bg-emerald-500/10 rounded-md animate-pulse" />
            <div className="skeleton h-4 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse" />
          </div>

          {/* Bio (Ancho aleatorio para realismo) */}
          <div 
            style={{ width: `${Math.floor(Math.random() * (60 - 40 + 1) + 40)}%` }}
            className="skeleton h-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-full animate-pulse" 
          />
        </div>
      </div>

      {/* Botón de Seguimiento Adaptativo */}
      <div className={`
        skeleton h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0 animate-pulse
        ${isMobile ? 'w-9' : 'w-28'}
      `} />
    </div>
  );
};