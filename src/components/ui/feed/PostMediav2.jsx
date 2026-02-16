import { useState, useMemo, useCallback } from "react";
import { useIsMobile } from "../../../hooks/useIsMobile";
import UniversalFeedVideo from "./FeedVideov2";

const PostMedia = ({ media = [], onOpen }) => {
  const isMobile = useIsMobile();

  // 🔥 Memo: obtener índices de videos SOLO cuando cambia media
  const videoIndexes = useMemo(
    () =>
      media.reduce((acc, item, i) => {
        if (item.media_type === "video") acc.push(i);
        return acc;
      }, []),
    [media]
  );

  // 🔥 Estado inicial ultra eficiente
  const [activeVideoIndex, setActiveVideoIndex] = useState(
    videoIndexes[0] ?? -1
  );

  // 🔥 Callback optimizado
  const handleVideoEnd = useCallback(() => {
    if (!videoIndexes.length) return;

    const currentPos = videoIndexes.indexOf(activeVideoIndex);
    const nextPos = (currentPos + 1) % videoIndexes.length;

    setActiveVideoIndex(videoIndexes[nextPos]);
  }, [activeVideoIndex, videoIndexes]);

  // 🔥 Render item memoizado
  const renderItem = useCallback(
    (item, index, customClass = "") => {
      const isVideo = item.media_type === "video";

      if (isVideo) {
        // if (isMobile) {
          return (
            // <FeedVideo
            //   src={item.media_url}
            //   customClass={customClass}
            //   shouldPlay={activeVideoIndex === index}
            //   onEnded={handleVideoEnd}
            //   onClick={() => onOpen(index)}
            // />
            <UniversalFeedVideo
              src={item.media_url}
              shouldPlay={activeVideoIndex === index}
              onEnded={handleVideoEnd} 
              className={customClass}
              onClick={() => onOpen(index)}
            />
          );
        // }

        // return (
        //   <video
        //     src={item.media_url}
        //     className={`${customClass} w-full object-cover rounded-xl`}
        //     controls
        //     muted
        //     preload="metadata"
        //     playsInline
        //     loading="lazy"
        //     onClick={(e) => e.stopPropagation()}
        //   />
        // );
      }

      return (
        <img
          src={item.media_url}
          alt={`Media ${index}`}
          loading="lazy"
          decoding="async"
          className={`${customClass} w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity`}
          onClick={() => onOpen(index)}
        />
      );
    },
    [isMobile, activeVideoIndex, handleVideoEnd, onOpen]
  );

  if (!media.length) return null;

  // 📦 CASO SINGLE MEDIA
  if (media.length === 1) {
    return (
      <div className="mb-3 mt-3">
        {renderItem(media[0], 0, "max-h-[500px]")}
      </div>
    );
  }

  // 📦 GRID LOGIC
  const displayMedia = media.slice(0, 4);
  const extraCount = media.length - 4;
  const isThreeLayout = media.length === 3;

  return (
    <div className="grid grid-cols-2 gap-1 mt-3 mb-3">
      {displayMedia.map((item, index) => {
        const spanClass =
          isThreeLayout && index === 0 ? "h-full max-h-[320px]" : "h-40";

        const containerClass =
          isThreeLayout && index === 0 ? "row-span-2" : "relative";

        return (
          <div key={item.id || index} className={containerClass}>
            {renderItem(item, index, spanClass)}

            {extraCount > 0 && index === 3 && (
              <div
                className="absolute inset-0 bg-black/60 hover:bg-black/70 rounded-xl flex items-center justify-center text-white text-2xl font-bold cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(3);
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
