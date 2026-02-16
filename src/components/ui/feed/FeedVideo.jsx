import React, { useRef, useEffect, useState } from "react";
import { Play } from "lucide-react";

const FeedVideo = ({ src, customClass, onClick, shouldPlay, onEnded }) => {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Solo intentamos reproducir si el video es el "activo" según el padre
    if (shouldPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          /* Autoplay manejado */
        });
      }
    } else {
      video.pause();
      video.currentTime = 0; // Opcional: reiniciar para que esté listo
    }
  }, [shouldPlay]);

  return (
    <div 
      className={`relative group cursor-pointer overflow-hidden bg-black/5 ${customClass}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover rounded-xl transition-transform duration-500"
        muted
        onEnded={onEnded}
      />


      {/* Overlay: Se oculta si el mouse está encima o si prefieres dejarlo siempre para móviles */}
      {!shouldPlay && (
        <div className={`absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-black/40 p-2 rounded-full text-white backdrop-blur-md border border-white/20">
          <Play size={20} fill="currentColor" />
        </div>
      </div>
      )}

      <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-md font-bold tracking-wider uppercase">
        Video
      </div>
    </div>
  );
};

export default FeedVideo;