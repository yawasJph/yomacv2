import React from "react";
import { X, Play, Trash2 } from "lucide-react";

const PostMediaGrid = ({ previews, removeFileOrGif, removeAllImages }) => {
  if (!previews || previews.length === 0) return null;

  const count = previews.length;

  // Lógica de clases para Desktop (Grilla)
  const getDesktopGridClass = () => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2 gap-2";
    return "grid-cols-2 grid-rows-2 gap-2";
  };

  return (
    <div className="mt-4 group">
      {/* --- VISTA MÓVIL: Carrusel Horizontal --- */}
      <div className="flex sm:hidden overflow-x-auto pb-2 gap-3 no-scrollbar snap-x snap-mandatory">
        {previews.map((mediaItem, index) => (
          <div 
            key={`mobile-${index}`}
            className="relative flex-none w-10/12 aspect-4/3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden snap-center border dark:border-neutral-700"
          >
            <MediaRender mediaItem={mediaItem} index={index} isMobile />
            <RemoveButton onClick={() => removeFileOrGif(index)} />
          </div>
        ))}
      </div>

      {/* --- VISTA DESKTOP: Grilla Dinámica --- */}
      <div className={`hidden sm:grid ${getDesktopGridClass()} min-h-[200px] max-h-[500px] overflow-hidden rounded-2xl border dark:border-neutral-700`}>
        {previews.map((mediaItem, index) => {
          let itemClass = "relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden";
          
          // Estilo tipo Pinterest/Twitter para 3 elementos
          if (count === 3 && index === 0) itemClass += " row-span-2 h-full";
          else if (count === 3) itemClass += " h-[246px]";
          else if (count === 4) itemClass += " h-[246px]";
          else itemClass += " h-auto";

          return (
            <div key={`desktop-${index}`} className={itemClass}>
              <MediaRender mediaItem={mediaItem} index={index} />
              <RemoveButton onClick={() => removeFileOrGif(index)} />
            </div>
          );
        })}
      </div>

      {/* --- FOOTER DE CONTROL --- */}
      <div className="flex justify-between items-center mt-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
             {/* Indicadores visuales de archivos */}
             {previews.map((_, i) => (
               <div key={i} className={`w-2 h-2 rounded-full border border-white dark:border-neutral-900 ${count >= 4 ? 'bg-red-500' : 'bg-emerald-500'}`} />
             ))}
          </div>
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-tighter">
            {count} / 4 seleccionados
          </span>
        </div>
        
        <button
          onClick={removeAllImages}
          className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          <Trash2 size={12} />
          Limpiar
        </button>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTE: Renderizador de Media --- */
const MediaRender = ({ mediaItem, index, isMobile = false }) => {
  const src = mediaItem.url || mediaItem;
  const type = mediaItem.type || 'image';
  const isVideo = type === 'video';
  const contentClass = "w-full h-full object-cover select-none";

  if (isVideo) {
    return (
      <div className="relative w-full h-full">
        <video src={src} className={contentClass} muted playsInline />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
            <Play size={20} fill="currentColor" />
          </div>
        </div>
        <span className="absolute bottom-2 left-2 bg-black/60 text-[10px] text-white px-2 py-0.5 rounded-md font-bold uppercase">
          Video
        </span>
      </div>
    );
  }

  return <img src={src} alt={`Preview ${index}`} className={contentClass} loading="lazy" />;
};

/* --- SUB-COMPONENTE: Botón de eliminar --- */
const RemoveButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-2 right-2 bg-black/50 hover:bg-gray-800 text-white p-1.5 rounded-full backdrop-blur-md transition-all z-20 hover:scale-110 active:scale-90"
  >
    <X size={14} strokeWidth={3} />
  </button>
);

export default PostMediaGrid;