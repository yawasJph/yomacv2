import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { useInView } from "react-intersection-observer";
import UniversalFeedVideo from "./FeedVideov4";

const PostMedia = ({ media = [], onOpen }) => {
  const isMobile = useIsMobile();
  const [hasEntered, setHasEntered] = useState(false);
  
  // ✅ Refs para controlar cada video
  const videoRefs = useRef({});

  // 🔥 Detectar si el post está en pantalla
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px 0px",
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) setHasEntered(true);
  }, [inView]);

  // 🔥 Memo: índices de videos
  const videoIndexes = useMemo(
    () =>
      media.reduce((acc, item, i) => {
        if (item.media_type === "video") acc.push(i);
        return acc;
      }, []),
    [media],
  );

  const [activeVideoIndex, setActiveVideoIndex] = useState(
    videoIndexes[0] ?? -1,
  );

  // 🔥 Cambiar al siguiente video automáticamente
  const handleVideoEnd = useCallback(() => {
    if (!videoIndexes.length) return;

    const currentPos = videoIndexes.indexOf(activeVideoIndex);
    const nextPos = (currentPos + 1) % videoIndexes.length;

    setActiveVideoIndex(videoIndexes[nextPos]);
  }, [activeVideoIndex, videoIndexes]);

  // ✅ Función mejorada para abrir modal
  const handleOpenModal = useCallback((index) => {
    // Pausar y resetear todos los videos del feed
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef && videoRef.reset) {
        videoRef.reset();
      }
    });
    
    // Abrir el modal
    onOpen(index);
  }, [onOpen]);

  const renderItem = useCallback(
    (item, index, ratioClass = "aspect-[6/4]") => {
      const isVideo = item.media_type === "video";

      return (
        <div
          className={`relative w-full overflow-hidden rounded-xl bg-muted ${ratioClass} transition-transform duration-300 hover:scale-[1.02]`}
        >
          {isVideo ? (
            <UniversalFeedVideo
              ref={(el) => (videoRefs.current[index] = el)}
              src={item.media_url}
              className="absolute inset-0 w-full h-full object-cover"
              shouldPlay={hasEntered && activeVideoIndex === index}
              onEnded={handleVideoEnd}
              onClick={() => handleOpenModal(index)}
            />
          ) : (
            <img
              src={item.media_url}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              onClick={() => handleOpenModal(index)}
            />
          )}
        </div>
      );
    },
    [isMobile, activeVideoIndex, handleVideoEnd, handleOpenModal, hasEntered],
  );

  if (!media.length) return null;

  // 📦 SINGLE MEDIA
  if (media.length === 1) {
    return (
      <div ref={ref} className="mb-3 mt-3">
        {renderItem(media[0], 0, "aspect-7/5 sm:aspect-16/9")}
      </div>
    );
  }

  // 📦 GRID LOGIC
  const displayMedia = media.slice(0, 4);
  const extraCount = media.length - 4;
  const isThreeLayout = media.length === 3;
  const isTwoLayout = media.length === 2;
  
  return (
    <div ref={ref} className="grid grid-cols-2 gap-1 mt-3 mb-3">
      {displayMedia.map((item, index) => {
        if(isTwoLayout){
          return (
            <div key={item.id || index} className="relative">
              {renderItem(item, index, "aspect-[7/9] sm:aspect-[5/5]")}
            </div>
          )
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