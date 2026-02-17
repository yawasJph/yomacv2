import React, { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const UniversalFeedVideo = ({
  src,
  shouldPlay,
  onEnded,
  className = "",
  onClick,    
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // 🎯 IntersectionObserver → pausa fuera de pantalla
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.6 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // 🎯 Autoplay inteligente
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay && isInView) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [shouldPlay, isInView]);

  // 🎯 Progress tracking
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setProgress((video.currentTime / video.duration) * 100);
  }, []);

  // 🎯 Manejar cuando el video termina
  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false); // ✅ Actualizar estado a false
    setProgress(0); // ✅ Resetear progreso
    if (onEnded) {
      onEnded();
    }
  }, [onEnded]);

  // 🎯 Toggle Play
  const togglePlay = useCallback((e) => {
    //e?.stopPropagation(); // Prevenir que se abra el modal
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // 🎯 Sincronizar estado cuando el video se pausa/reproduce
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl bg-black group ${className}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={onClick}
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        playsInline
        preload="metadata"
        onEnded={handleVideoEnded} // ✅ Usar la función que actualiza el estado
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover"
      />

      {/* CENTER PLAY BUTTON */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all hover:bg-black/20"
        >
          <div className="bg-black/60 backdrop-blur-md border border-white/20 p-3 rounded-full transition-transform hover:scale-110">
            <Play size={24} className="text-white" fill="white" />
          </div>
        </button>
      )}

      {/* PROGRESS BAR (opcional, se ve bien en hover) */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* VIDEO TAG */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
        VIDEO
      </div>
    </div>
  );
};

export default UniversalFeedVideo;