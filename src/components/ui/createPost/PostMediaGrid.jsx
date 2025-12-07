// 📦 components/PostMediaGrid.jsx
import React from "react";
import { X, Play } from "lucide-react"; // Agregamos ícono Play por si quieres decorar

const PostMediaGrid = ({ previews, removeFileOrGif, removeAllImages }) => {
  if (!previews || previews.length === 0) return null;

  // --- Lógica de Diseño de Grid Dinámico (Intacta) ---
  const count = previews.length;
  let gridClass = "grid-cols-2 gap-1"; 
  const containerHeightClass = count > 1 ? "h-96" : "h-auto"; // Cambio ligero: h-auto para 1 solo elemento

  if (count === 1) {
    gridClass = "grid-cols-1";
  } else if (count >= 2) {
    gridClass = "grid-cols-2 gap-1"; 
  }

  return (
    <div className="mt-8">
      <div className={`grid ${gridClass} ${containerHeightClass} mt-3`}>
        {previews.map((mediaItem, index) => {
          // 1. Extraemos URL y Tipo de forma segura
          // Si es un objeto (lo nuevo), usa .url y .type. Si es string (legacy), úsalo directo.
          const src = mediaItem.url || mediaItem;
          const type = mediaItem.type || 'image'; 
          const isVideo = type === 'video';

          let itemClass = "relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800";
          let contentClass = "w-full h-full object-cover"; // 'object-cover' funciona en videos también
          
          if (count === 1) {
             itemClass += " h-auto max-h-96"; // Limite de altura para video único
          } else if (count === 2) {
             itemClass += " h-full";
          } else if (count === 3) {
            if (index === 0) {
              itemClass += " col-span-1 row-span-2 h-full";
            } else {
              itemClass += " h-48"; 
            }
          } else if (count === 4) {
             itemClass += " h-48";
          }

          return (
            <div 
              key={index} 
              className={itemClass}
            >
              {/* 2. Renderizado Condicional */}
              {isVideo ? (
                <video
                  src={src}
                  className={contentClass}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className={contentClass} 
                />
              )}

              {/* Botón de eliminar */}
              <button
                onClick={() => removeFileOrGif(index)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full cursor-pointer transition-all z-20"
                title="quitar archivo"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {count}/4 archivos
        </span>
        <button
          onClick={removeAllImages}
          className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        >
          Eliminar todos
        </button>
      </div>
    </div>
  );
};

export default PostMediaGrid;