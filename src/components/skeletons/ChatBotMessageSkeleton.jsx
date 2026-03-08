export const MessageItemSkeleton = ({ isUser = false, hasImage = false }) => {
  return (
    <div
      className={`flex w-full mb-6 animate-pulse ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex flex-col max-w-[85%] w-full ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`relative p-4 md:p-5 rounded-4xl w-full shadow-2xl ${
            isUser
              ? "bg-neutral-700 rounded-br-none"
              : "bg-neutral-900 border border-neutral-800 rounded-bl-none"
          }`}
        >
          {/* SIMULACIÓN DE IMAGEN ADJUNTA */}
          {hasImage && (
            <div className="skeleton mb-4 rounded-2xl overflow-hidden bg-neutral-800/50 aspect-video w-full" />
          )}

          {/* SIMULACIÓN DE TEXTO/MARKDOWN */}
          <div className="space-y-3">
            <div className={`skeleton h-3 rounded-full bg-neutral-600/50 ${isUser ? 'w-full' : 'w-5/6'}`} />
            <div className={`skeleton h-3 rounded-full bg-neutral-600/50 ${isUser ? 'w-4/5' : 'w-full'}`} />
            
            {/* Simulación de una línea más corta al final */}
            <div className="skeleton h-3 w-1/2 rounded-full bg-neutral-600/50" />
          </div>

          {/* SIMULACIÓN DE BLOQUE DE CÓDIGO (Solo si no tiene imagen para variar) */}
          {!hasImage && !isUser && (
            <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <div className="skeleton h-2 w-1/3 bg-neutral-700 rounded" />
              <div className="skeleton h-2 w-full bg-neutral-700/50 rounded" />
              <div className="skeleton h-2 w-2/3 bg-neutral-700/50 rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};