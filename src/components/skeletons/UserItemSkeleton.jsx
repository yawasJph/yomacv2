const UserItemSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100 dark:border-gray-800 animate-pulse">
      {/* LEFT SIDE: Avatar e Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar Circular */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />

        <div className="min-w-0 flex-1 space-y-2">
          {/* Nombre de usuario */}
          <div className="h-4 w-3/4 max-w-[150px] bg-zinc-200 dark:bg-zinc-800 rounded-md" />

          {/* Fila de Badges (pequeños círculos/cuadrados) */}
          <div className="flex gap-1">
            <div className="h-3 w-3 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
            <div className="h-3 w-3 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
            <div className="h-3 w-3 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
          </div>

          {/* Fila de Tags (Carrera y Ciclo) */}
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-emerald-100/30 dark:bg-emerald-500/5 rounded-md" />
            <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
          </div>

          {/* Bio (Línea delgada) */}
          <div className="h-3 w-full max-w-[200px] bg-zinc-50 dark:bg-zinc-900/50 rounded-md" />
        </div>
      </div>

      {/* RIGHT SIDE: Follow Button */}
      <div className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
    </div>
  );
};