// 📦 components/PostMediaGrid.jsx
import React from "react";
import { X } from "lucide-react";

const PostMediaGrid = ({ previews, removeFileOrGif, removeAllImages }) => {
  if (previews.length === 0) return null;

  // --- Lógica de Diseño de Grid Dinámico ---

  const count = previews.length;
  let gridClass = "grid-cols-2 gap-1"; // Por defecto para 2, 3, 4
  
  // Altura total del contenedor, ajustada para que las columnas coincidan
  const containerHeightClass = count > 1 ? "h-96" : "h-96"; 

  if (count === 1) {
    gridClass = "grid-cols-1";
  } else if (count >= 2) {
    gridClass = "grid-cols-2 gap-1"; 
  }

  // --- JSX del Componente ---
  return (
    <div className="mt-8">
      <div className={`grid ${gridClass} ${containerHeightClass} mt-3`}>
        {previews.map((preview, index) => {
          
          let itemClass = "relative w-full overflow-hidden rounded-lg";
          let imageClass = "w-full h-full object-cover";
          
          if (count === 1) {
             // 1 imagen: ocupa todo el ancho y alto automático
             itemClass += " h-auto";
          } else if (count === 2) {
             // 2 imágenes: se dividen 50/50, altura fija
             itemClass += " h-full";
          } else if (count === 3) {
            // 3 imágenes: 
            if (index === 0) {
              // IMAGEN 1 (Izquierda): Ocupa toda la altura (span 2 filas en un grid de 2x2)
              itemClass += " col-span-1 row-span-2 h-full";
            } else {
              // IMAGEN 2 y 3 (Derecha): Se apilan 50/50 de la altura
              itemClass += " h-48"; // h-1/2 con h-96 en el padre = h-48
            }
          } else if (count === 4) {
             // 4 imágenes: 2x2, altura fija
             itemClass += " h-48";
          }

          return (
            <div 
              key={index} 
              className={itemClass}
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className={imageClass} 
              />
              <button
                onClick={() => removeFileOrGif(index)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full cursor-pointer transition-all z-10"
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