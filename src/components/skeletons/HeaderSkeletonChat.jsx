export const HeaderSkeleton = () => {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      {/* Círculo del Avatar */}
      <div className="skeleton w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      
      <div className="space-y-2">
        {/* Línea del Nombre */}
        <div className="skeleton h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        {/* Línea del Estado (En línea/Desconectado) */}
        <div className="skeleton h-2 w-16 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
      </div>
    </div>
  );
};