import React from "react";

const PostImages = ({images, onOpen}) => {
  if (!images || images.length === 0) return null;

  // Caso 1: Una sola imagen (formato grande)
  if (images.length === 1) {
    return (
      <div className="mb-3 mt-3">
        <img
          src={images[0].image_url}
          alt="Post"
          className="w-full max-h-[500px] object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => onOpen(0)}//onOpen(0)
        />
      </div>
    );
  }

  // Caso 2: Múltiples imágenes (Grid)
  // Limitamos a visualizar máximo 4 bloques
  const displayImages = images.slice(0, 4);
  const extraCount = images.length - 4;

  // Lógica de clases para el Grid (Estilo "Masonry" ligero)
  const gridCols = images.length === 2 ? "grid-cols-2" : "grid-cols-2";

  return (
    <div className={`grid ${gridCols} gap-1 mt-3 mb-3`}>
      {displayImages.map((img, index) => {
        // Lógica para que la primera imagen ocupe 2 espacios si son 3 imágenes (estilo Twitter)
        const isThreeLayout = images.length === 3;
        const spanClass =
          isThreeLayout && index === 0 ? "row-span-2 h-full" : "h-40";

        return (
          <div
            key={index}
            className={`relative ${
              isThreeLayout && index === 0 ? "row-span-2" : ""
            }`}
          >
            <img
              src={img.image_url}
              alt={`Preview ${index + 1}`}
              className={`w-full ${spanClass} object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity`}
              onClick={() => onOpen(index)}//onOpen(index)
            />

            {/* Overlay para "+X imágenes" en la última foto visible (la 4ta) */}
            {extraCount > 0 && index === 3 && (
              <div
                className="absolute inset-0 bg-black/60 hover:bg-black/70 rounded-xl flex items-center justify-center text-white text-2xl font-bold cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(3); // Abre el modal iniciando en la 4ta foto
                }}
              >
                +{extraCount}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PostImages;
