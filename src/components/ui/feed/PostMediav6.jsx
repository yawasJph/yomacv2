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
    [media],
  );

  const [activeAnimatedIndex, setActiveAnimatedIndex] = useState(
    animatedIndexes[0] ?? -1,
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
        if (videoRef && videoRef.reset) {
          videoRef.reset();
        }
      });
      onOpen(index);
    },
    [onOpen],
  );

  // 🔥 MEJORA: renderItem ahora acepta un parámetro extra "customStyle"
  const renderItem = useCallback(
    (item, index, ratioClass = "aspect-[6/4]", customStyle = {}) => {
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

      return (
        <div
          style={customStyle} // 👈 Inyectamos el aspect_ratio aquí
          className={`relative w-full overflow-hidden rounded-xl bg-muted ${ratioClass} transition-transform duration-300 hover:scale-[1.02]`}
        >
          {isAnimated ? (
            <UniversalFeedVideo
              ref={(el) => (videoRefs.current[index] = el)}
              src={isGif ? finalSrc : optimizeMedia(item.media_url, "video")}
              poster={isGif ? posterSrc : undefined}
              isGif={isGif}
              className="absolute inset-0 w-full h-full object-cover"
              shouldPlay={hasEntered && activeAnimatedIndex === index}
              onEnded={handleAnimatedEnd}
              onClick={() => handleOpenModal(index)}
            />
          ) : (
            <img
              src={optimizeMedia(item.media_url, item.media_type)}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              onClick={() => handleOpenModal(index)}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          )}
        </div>
      );
    },
    [
      isMobile,
      activeAnimatedIndex,
      handleAnimatedEnd,
      handleOpenModal,
      hasEntered,
    ],
  );

  if (!media.length) return null;

  // 🔥 MEJORA: Lógica de renderizado para 1 solo item (soporta dynamic aspect ratio)
  if (media.length === 1) {
    const item = media[0];
    
    // Obtenemos el ratio directamente, o lo calculamos si por alguna razón solo vinieron width y height
    const dynamicRatio = item.aspect_ratio || (item.width && item.height ? item.width / item.height : null);
    const hasDynamicRatio = dynamicRatio && !isNaN(dynamicRatio);

    // Si tenemos ratio real, quitamos la clase de Tailwind y usamos estilos en línea. Si es GIF, usamos el default.
    const ratioClass = hasDynamicRatio ? "" : "aspect-[7/5] sm:aspect-[16/9]";
    const customStyle = hasDynamicRatio ? { aspectRatio: dynamicRatio } : {};

    // UX Tip: Si es un formato muy vertical (Reel 9:16 o retrato), en PC no queremos que ocupe todo el ancho 
    // porque se vería exageradamente alto. Lo centramos y le damos un max-width moderado.
    const isPortrait = hasDynamicRatio && dynamicRatio < 0.85;

    return (
      <div 
        ref={ref} 
        className={`mb-3 mt-3 w-full ${isPortrait ? "sm:max-w-sm md:max-w-md sm:mx-auto" : ""}`}
      >
        {renderItem(item, 0, ratioClass, customStyle)}
      </div>
    );
  }

  // --- EL RESTO QUEDA EXACTAMENTE IGUAL ---
  const displayMedia = media.slice(0, 4);
  const extraCount = media.length - 4;
  const isThreeLayout = media.length === 3;
  const isTwoLayout = media.length === 2;

  return (
    <div ref={ref} className="grid grid-cols-2 gap-1 mt-3 mb-3">
      {displayMedia.map((item, index) => {
        if (isTwoLayout) {
          return (
            <div key={item.id || index} className="relative">
              {renderItem(item, index, "aspect-[7/9] sm:aspect-[5/5]")}
            </div>
          );
        }

        const ratioClass =
          isThreeLayout && index === 0
            ? "aspect-[6/10] sm:aspect-[7/10]"
            : "aspect-[6/5] sm:aspect-[7/5]";

        const containerClass =
          isThreeLayout && index === 0 ? "row-span-2" : "relative";

        return (
          <div key={item.id || index} className={containerClass}>
            {renderItem(item, index, ratioClass)}

            {extraCount > 0 && index === 3 && (
              <div
                className="absolute inset-0 bg-black/60 hover:bg-black/70 rounded-xl flex items-center justify-center text-white text-2xl font-bold cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(3);
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

export default PostMedia;