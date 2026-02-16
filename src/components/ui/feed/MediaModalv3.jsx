
import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import CustomVideoPlayer from "./CustomVideoPlayer ";

// Componente MediaModal mejorado
const MediaModal = ({ media, closeModal, initialIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const goToPrevious = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const currentItem = media[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black/97 backdrop-blur-md flex justify-center items-center z-[9999] animate-fadeIn"
      onClick={closeModal}
    >
      <div
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Renderizado dinámico según el tipo */}
        {currentItem.media_type === "video" ? (
          <CustomVideoPlayer src={currentItem.media_url} />
        ) : (
          <img
            src={currentItem.media_url}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-scaleIn"
            alt="Media"
            draggable={false}
          />
        )}

        {/* Botón Cerrar */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-2 sm:p-2.5 rounded-full transition-all hover:scale-110 z-10 backdrop-blur-sm"
          aria-label="Cerrar"
        >
          <X size={24} className="sm:w-7 sm:h-7" />
        </button>

        {/* Navegación (Solo si hay más de un elemento) */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-black/50 hover:bg-black/80 p-2 sm:p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
              aria-label="Anterior"
            >
              <ChevronLeft size={28} className="sm:w-8 sm:h-8" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-black/50 hover:bg-black/80 p-2 sm:p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
              aria-label="Siguiente"
            >
              <ChevronRight size={28} className="sm:w-8 sm:h-8" />
            </button>

            {/* Contador de posición - Mejorado */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white text-xs sm:text-sm font-medium bg-black/60 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10">
              {currentIndex + 1} / {media.length}
            </div>
          </>
        )}
      </div>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MediaModal;