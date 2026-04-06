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

  // 🔥 MEJORA: Detectar tanto Videos como GIFs
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

  const renderItem = useCallback(
    (item, index, ratioClass = "aspect-[6/4]") => {
      const isOriginalVideo = item.media_type === "video";
      const isGif =
        item.media_type === "gif" ||
        item.media_url?.toLowerCase().endsWith(".gif");
      const isAnimated = isOriginalVideo || isGif;

      // 🔥 Generamos el video y la portada
      let finalSrc = item.media_url;
      let posterSrc = undefined;

      if (isGif) {
        // Obligamos a Cloudinary a darnos un MP4 real
        finalSrc = item.media_url.replace(/\.gif$/i, ".mp4");
        // Sacamos el primer frame en JPG para usarlo de portada y evitar pantallas negras
        posterSrc = item.media_url.replace(/\.gif$/i, ".jpg");
      }

      return (
        <div
          className={`relative w-full overflow-hidden rounded-xl bg-muted ${ratioClass} transition-transform duration-300 hover:scale-[1.02]`}
        >
          {isAnimated ? (
            <UniversalFeedVideo
              ref={(el) => (videoRefs.current[index] = el)}
              // 🚨 CLAVE: Si es GIF pasamos la URL pura para que f_auto no lo rompa
              src={isGif ? finalSrc : optimizeMedia(item.media_url, "video")}
              poster={isGif ? posterSrc : undefined} // 👈 Pasamos la portada
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

  // ... (TODA TU LÓGICA DE GRID QUEDA EXACTAMENTE IGUAL) ...
  if (media.length === 1) {
    const mediaItem = media[0];
    const isVertical = mediaItem.aspect_ratio < 1 && mediaItem.aspect_ratio != null;
    const ratio_class = isVertical ? "max-h-[500px]" : "aspect-7/5 sm:aspect-16/9"
    return (
      <div ref={ref} className="mb-3 mt-3">
        {renderItem(media[0], 0, ratio_class)}
      </div>
    );
  }

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
