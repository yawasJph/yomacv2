import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { useInView } from "react-intersection-observer";
import UniversalFeedVideo from "./FeedVideov5";
import { optimizeMedia } from "@/cloudinary/optimizeMedia";

const PostMedia = ({ media = [], onOpen }) => {
  const isMobile = useIsMobile();
  const [hasEntered, setHasEntered] = useState(false);
  const videoRefs = useRef({});

  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px 0px",
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) setHasEntered(true);
  }, [inView]);

  // Identificamos índices de medios animados (Videos y GIFs) para autoreproducción secuencial
  const animatedIndexes = useMemo(
    () =>
      media.reduce((acc, item, i) => {
        const isVideo = item.media_type === "video";
        const isGif =
          item.media_type === "gif" ||
          item.media_url?.toLowerCase().endsWith(".gif");
        if (isVideo || isGif) acc.push(i);
        return acc;
      }, []),
    [media]
  );

  const [activeAnimatedIndex, setActiveAnimatedIndex] = useState(
    animatedIndexes[0] ?? -1
  );

  const handleAnimatedEnd = useCallback(() => {
    if (!animatedIndexes.length) return;
    const currentPos = animatedIndexes.indexOf(activeAnimatedIndex);
    const nextPos = (currentPos + 1) % animatedIndexes.length;
    setActiveAnimatedIndex(animatedIndexes[nextPos]);
  }, [activeAnimatedIndex, animatedIndexes]);

  const handleOpenModal = useCallback(
    (index) => {
      Object.values(videoRefs.current).forEach((videoRef) => {
        if (videoRef && videoRef.reset) videoRef.reset();
      });
      onOpen(index);
    },
    [onOpen]
  );

  // 📸 Función base que renderiza solo el contenido (Video/Img) ocupando el 100% de su contenedor padre
  const renderMediaContent = useCallback(
    (item, index) => {
      const isOriginalVideo = item.media_type === "video";
      const isGif =
        item.media_type === "gif" ||
        item.media_url?.toLowerCase().endsWith(".gif");
      const isAnimated = isOriginalVideo || isGif;

      let finalSrc = item.media_url;
      let posterSrc = undefined;

      if (isGif) {
        finalSrc = item.media_url.replace(/\.gif$/i, ".mp4");
        posterSrc = item.media_url.replace(/\.gif$/i, ".jpg");
      }

      const handleClick = (e) => {
        e.stopPropagation();
        handleOpenModal(index);
      };

      if (isAnimated) {
        return (
          <UniversalFeedVideo
            ref={(el) => (videoRefs.current[index] = el)}
            src={isGif ? finalSrc : optimizeMedia(item.media_url, "video")}
            poster={isGif ? posterSrc : undefined}
            isGif={isGif}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            shouldPlay={hasEntered && activeAnimatedIndex === index}
            onEnded={handleAnimatedEnd}
            onClick={handleClick}
          />
        );
      }

      return (
        <img
          src={optimizeMedia(item.media_url, item.media_type)}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          onClick={handleClick}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          alt="Post media"
        />
      );
    },
    [activeAnimatedIndex, handleAnimatedEnd, handleOpenModal, hasEntered]
  );

  if (!media || media.length === 0) return null;

  // ==========================================
  // LAYOUT 1: EXACTAMENTE 1 MEDIA
  // ==========================================
  // Respeta rigurosamente el aspect_ratio.
  if (media.length === 1) {
    const item = media[0];
    const dynamicRatio = item.aspect_ratio || (item.width && item.height ? item.width / item.height : null);
    
    // Fallback: Si no hay ratio (Ej. un GIF de Tenor), usamos 16/9 o 4/3 dependiendo de si es móvil
    const finalRatio = dynamicRatio || (isMobile ? 4/3 : 16/9);
    
    // Si es muy vertical (Reel / Retrato), limitamos el ancho en PC para que no ocupe todo el monitor de alto
    const isPortrait = finalRatio < 0.85;

    return (
      <div ref={ref} className="mt-3 mb-3 w-full flex">
        <div
          style={{ aspectRatio: finalRatio }}
          className={`relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group ${
            isPortrait ? "w-full sm:max-w-md" : "w-full"
          }`}
        >
          {renderMediaContent(item, 0)}
        </div>
      </div>
    );
  }

  // ==========================================
  // LAYOUTS MULTIPLES (2, 3, o 4+ MEDIAS)
  // ==========================================
  // Estilo Twitter: Cuadrícula con gap sutil de 2px, esquinas unificadas redondeadas
  const displayMedia = media.slice(0, 4);
  const extraCount = media.length - 4;

  return (
    <div
      ref={ref}
      // El aspect ratio del contenedor global: Cuadrado en móviles para maximizar impacto, 3:2 apaisado en PC
      className="mt-3 mb-3 relative w-full aspect-square sm:aspect-3/2 flex gap-0.5 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800"
    >
      {/* 2 MEDIOS: Mitad y Mitad */}
      {displayMedia.length === 2 && (
        <>
          <div className="relative w-1/2 h-full group bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            {renderMediaContent(displayMedia[0], 0)}
          </div>
          <div className="relative w-1/2 h-full group bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            {renderMediaContent(displayMedia[1], 1)}
          </div>
        </>
      )}

      {/* 3 MEDIOS: 1 a la izquierda, 2 apilados a la derecha */}
      {displayMedia.length === 3 && (
        <>
          <div className="relative w-1/2 h-full group bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            {renderMediaContent(displayMedia[0], 0)}
          </div>
          <div className="w-1/2 h-full flex flex-col gap-0.5">
            <div className="relative w-full h-1/2 group bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
              {renderMediaContent(displayMedia[1], 1)}
            </div>
            <div className="relative w-full h-1/2 group bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
              {renderMediaContent(displayMedia[2], 2)}
            </div>
          </div>
        </>
      )}

      {/* 4+ MEDIOS: Cuadrícula 2x2 */}
      {displayMedia.length === 4 && (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
          {displayMedia.map((item, index) => (
            <div
              key={item.id || index}
              className="relative w-full h-full group bg-zinc-100 dark:bg-zinc-900 overflow-hidden"
            >
              {renderMediaContent(item, index)}

              {/* OVERLAY DEL CONTADOR SI HAY MÁS DE 4 */}
              {extraCount > 0 && index === 3 && (
                <div
                  className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-3xl font-bold cursor-pointer hover:bg-black/70 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(3);
                  }}
                >
                  +{extraCount}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostMedia;