import React, { useRef, useEffect, useState } from "react";
import { Play } from "lucide-react";

const FeedVideo = ({ src, customClass, onClick }) => {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Configuración del Observer
    const options = {
      root: null, // relativo al viewport
      rootMargin: "0px",
      threshold: 0.6, // Se activa cuando el 60% del video es visible
    };

    const handlePlay = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {
            // Manejar bloqueo de reproducción automática del navegador
            console.log("Autoplay bloqueado hasta interacción");
          });
        } else {
          videoRef.current?.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handlePlay, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    // Limpieza al desmontar el componente
    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, [src]);

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
        loop
        playsInline
      />
      
      {/* Overlay: Se oculta si el mouse está encima o si prefieres dejarlo siempre para móviles */}
      <div className={`absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-black/40 p-2 rounded-full text-white backdrop-blur-md border border-white/20">
          <Play size={20} fill="currentColor" />
        </div>
      </div>

      <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-md font-bold tracking-wider uppercase">
        Video
      </div>
    </div>
  );
};

export default FeedVideo;