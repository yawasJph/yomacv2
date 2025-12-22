import { useIsMobile } from "../../../hooks/useIsMobile";
import FeedVideo from "./FeedVideo";

const PostMedia = ({ media, onOpen }) => {
  const isMobile = useIsMobile();
  if (!media || media.length === 0) return null;

  // Función auxiliar para renderizar el contenido (Imagen o Video)
  const renderItem = (item, index, customClass = "") => {
    const isVideo = item.media_type === "video";

    if (isVideo) {
      return (
        <>
          {isMobile ? (
            <FeedVideo
              src={item.media_url}
              customClass={customClass}
              onClick={() => onOpen(index)} // Ahora el click abre el modal
            />
          ) : (
            <video
              src={item.media_url}
              className={`${customClass} w-full object-cover rounded-xl`}
              controls
              muted
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </>
      );
    }

    return (
      <img
        src={item.media_url}
        alt={`Media ${index}`}
        className={`${customClass} w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity`}
        onClick={() => onOpen(index)}
      />
    );
  };

  // CASO 1: Un solo archivo
  if (media.length === 1) {
    return (
      <div className="mb-3 mt-3">
        {renderItem(media[0], 0, "max-h-[500px]")}
      </div>
    );
  }

  // CASO 2: Múltiples archivos (Grid)
  const displayMedia = media.slice(0, 4);
  const extraCount = media.length - 4;
  const isThreeLayout = media.length === 3;

  return (
    <div className="grid grid-cols-2 gap-1 mt-3 mb-3">
      {displayMedia.map((item, index) => {
        // Ajuste de altura para el grid estilo "Twitter"
        const spanClass =
          isThreeLayout && index === 0 ? "h-full max-h-[320px]" : "h-40";
        const containerClass =
          isThreeLayout && index === 0 ? "row-span-2" : "relative";

        return (
          <div key={item.id || index} className={containerClass}>
            {renderItem(item, index, spanClass)}

            {/* Overlay para archivos adicionales */}
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
