import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import ModernVideoPlayer from "./ModernVideoPlayer";

const MediaViewerModal = ({ media, initialIndex, isOpen, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const videos = document.querySelectorAll("video");
    videos.forEach((v) => {
      v.pause();
      v.currentTime = 0;
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const item = media[index];

  const next = () => setIndex((i) => (i + 1) % media.length);
  const prev = () => setIndex((i) => (i - 1 + media.length) % media.length);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in"
    onClick={(e) => e.stopPropagation()}>
      {/* CLOSE */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/80 hover:text-white"
      >
        <X size={28} />
      </button>

      {/* NAV ARROWS */}
      {media.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-6 text-white/80 hover:text-white"
          >
            <ChevronLeft size={40} />
          </button>

          <button
            onClick={next}
            className="absolute right-6 text-white/80 hover:text-white"
          >
            <ChevronRight size={40} />
          </button>
        </>
      )}

      {/* MEDIA */}
      <div className="max-w-[95vw] max-h-[90vh] flex items-center justify-center">
        {item.media_type === "video" ? (
          <div className="relative">
            {/* <video
              src={item.media_url}
              controls
              autoPlay
              muted={muted}
              className="max-h-[90vh] max-w-[95vw] rounded-xl"
            /> */}
            <ModernVideoPlayer src={item.media_url} />


            {/* MUTE BUTTON */}
            {/* <button
              onClick={() => setMuted(!muted)}
              className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full text-white"
            >
              {muted ? <VolumeX /> : <Volume2 />}
            </button> */}
          </div>
        ) : (
          <img
            src={item.media_url}
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl"
          />
        )}
      </div>

      {/* COUNTER */}
      {media.length > 1 && (
        <div className="absolute bottom-6 text-white/70 text-sm font-semibold">
          {index + 1} / {media.length}
        </div>
      )}
    </div>
  );
};

export default MediaViewerModal;
