import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import CustomVideoPlayer from "./CustomVideoPlayerv2";

// Componente MediaModal mejorado
const MediaModal = ({ media, closeModal, initialIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);

  // Distancia mínima para considerar un swipe (en px)
  const minSwipeDistance = 50;

  const goToNext = (e) => {
    e?.stopPropagation();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = (e) => {
    e?.stopPropagation();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Manejar inicio del toque
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Manejar movimiento del toque
  const onTouchMove = (e) => {
    if (!touchStart) return;

    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    setTouchEnd(currentTouch);

    // Solo aplicar offset si hay múltiples elementos
    if (media.length > 1) {
      // Limitar el offset para no arrastrar demasiado
      const limitedOffset = Math.max(-150, Math.min(150, diff));
      setSwipeOffset(limitedOffset);
    }
  };

  // Manejar fin del toque
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (media.length > 1) {
      if (isLeftSwipe) {
        goToNext();
      } else if (isRightSwipe) {
        goToPrevious();
      }
    }

    // Reset
    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
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
  }, [currentIndex, isTransitioning]);

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
      className="fixed inset-0 bg-black/97 backdrop-blur-md flex justify-center items-center z-9999 animate-fadeIn"
      onClick={closeModal}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Contenedor de media con efecto de swipe */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `translateX(${swipeOffset}px)`,
            opacity: Math.max(0.5, 1 - Math.abs(swipeOffset) / 200),
          }}
        >
          {/* Renderizado dinámico según el tipo */}
          {currentItem.media_type === "video" ? (
            <CustomVideoPlayer src={currentItem.media_url} key={currentIndex} />
          ) : (
            <img
              src={currentItem.media_url}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-scaleIn"
              alt="Media"
              draggable={false}
            />
          )}
        </div>

        {/* Indicador visual de swipe (solo móvil) */}
        {media.length > 1 && Math.abs(swipeOffset) > 20 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-8 sm:hidden">
            {swipeOffset < -20 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 animate-pulse">
                <ChevronLeft size={32} className="text-white" />
              </div>
            )}
            {swipeOffset > 20 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 animate-pulse ml-auto">
                <ChevronRight size={32} className="text-white" />
              </div>
            )}
          </div>
        )}

        {/* Botón Cerrar */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 active:bg-black/90 p-2 sm:p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 z-10 backdrop-blur-sm touch-manipulation"
          aria-label="Cerrar"
        >
          <X size={24} className="sm:w-7 sm:h-7" />
        </button>

        {/* Navegación (Solo si hay más de un elemento) */}
        {media.length > 1 && (
          <>
            {/* Botones de navegación - Ocultos en móvil durante swipe */}
            <button
              onClick={goToPrevious}
              disabled={isTransitioning}
              className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-black/50 hover:bg-black/80 active:bg-black/90 p-2 sm:p-3 rounded-full transition-all hover:scale-110 active:scale-95 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation hidden sm:flex"
              aria-label="Anterior"
            >
              <ChevronLeft size={28} className="sm:w-8 sm:h-8" />
            </button>
            <button
              onClick={goToNext}
              disabled={isTransitioning}
              className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-black/50 hover:bg-black/80 active:bg-black/90 p-2 sm:p-3 rounded-full transition-all hover:scale-110 active:scale-95 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation hidden sm:flex"
              aria-label="Siguiente"
            >
              <ChevronRight size={28} className="sm:w-8 sm:h-8" />
            </button>

            {/* Contador de posición - Mejorado con indicadores de puntos en móvil */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              {/* Indicadores de puntos (solo móvil) */}
              <div className="flex gap-1.5 sm:hidden">
                {media.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Contador numérico */}
              <div className="text-white text-xs sm:text-sm font-medium bg-black/60 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 max-sm:hidden">
                {currentIndex + 1} / {media.length}
              </div>
            </div>

            {/* Hint de swipe (solo se muestra una vez en móvil) */}
            {/* {currentIndex === 0 && media.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 sm:hidden animate-bounce">
                <div className="text-white/60 text-xs bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                  <ChevronLeft size={14} />
                  <span>Desliza para navegar</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            )} */}
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
