import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Play } from "lucide-react";

// 🔥 Añadimos isGif por defecto en false
const UniversalFeedVideo = forwardRef(
  ({ src, poster, shouldPlay, onEnded, className = "", onClick, isGif = false }, ref) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [muted, setMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isHover, setIsHover] = useState(false);
    const [isInView, setIsInView] = useState(false);

    useImperativeHandle(ref, () => ({
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      reset: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
          setIsPlaying(false);
          setProgress(0);
        }
      },
    }));

    // 🎯 IntersectionObserver → pausa fuera de pantalla (MÁS SENSIBLE)
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => setIsInView(entry.isIntersecting),
        { threshold: 0.2 }, // 👈 Reducido de 0.6 a 0.2 para que funcione perfecto en móvil
      );

      if (containerRef.current) observer.observe(containerRef.current);

      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (shouldPlay && isInView) {
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }, [shouldPlay, isInView]);

    const handleTimeUpdate = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      setProgress((video.currentTime / video.duration) * 100);
    }, []);

    const handleVideoEnded = useCallback(() => {
      setIsPlaying(false);
      setProgress(0);
      if (onEnded) {
        onEnded();
      }
    }, [onEnded]);

    const togglePlay = useCallback((e) => {
      e?.stopPropagation();
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

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
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
        <video
          ref={videoRef}
          src={src} 
          poster={poster} // 👈 2. Añade esta línea aquí
          muted={muted}
          playsInline
          preload={isGif}
          onEnded={handleVideoEnded}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          
        />

        {/* 👈 CORRECCIÓN UX: Solo mostramos Play si NO es un GIF */}
        {!isPlaying && !isGif && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all hover:bg-black/20"
          >
            <div className="bg-black/60 backdrop-blur-md border border-white/20 p-3 rounded-full transition-transform hover:scale-110">
              <Play size={24} className="text-white" fill="white" />
            </div>
          </button>
        )}

        {/* 👈 CORRECCIÓN UX: Solo mostramos progreso si NO es un GIF */}
        {isPlaying && !isGif && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-white transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ETIQUETA DINÁMICA */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
          {isGif ? "GIF" : "VIDEO"}
        </div>
      </div>
    );
  },
);

UniversalFeedVideo.displayName = "UniversalFeedVideo";

export default UniversalFeedVideo;