import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useEffect, useState } from "react";

const MediaModal = ({ media, closeModal, initialIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = (e) => {
    e?.stopPropagation(); // Evitamos que el clic cierre el modal
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const goToPrevious = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  // Sincronizar el índice inicial cuando se abre el modal
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Manejo de teclas (Esc para cerrar, Flechas para navegar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const currentItem = media[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-[100]"
      onClick={closeModal}
    >
      <div
        className="relative w-full h-full flex items-center justify-center p-2 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Renderizado dinámico según el tipo */}
        {currentItem.media_type === "video" ? (
          <video
            src={currentItem.media_url}
            className="max-w-full max-h-[90vh] rounded-md shadow-2xl"
            controls
            autoPlay
            playsInline
          />
        ) : (
          <img
            src={currentItem.media_url}
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
            alt="Fullscreen Media"
          />
        )}

        {/* Botón Cerrar */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition z-10"
        >
          <X size={24} />
        </button>

        {/* Navegación (Solo si hay más de un elemento) */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 p-3 rounded-full transition"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 p-3 rounded-full transition"
            >
              <ChevronRight size={32} />
            </button>

            {/* Contador de posición */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm bg-black/20 px-3 py-1 rounded-full">
              {currentIndex + 1} / {media.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaModal;