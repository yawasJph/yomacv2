import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

// Componente VideoPlayer personalizado
const CustomVideoPlayer = ({ src, autoPlay = true }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Formatear tiempo (segundos a mm:ss)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Actualizar tiempo actual
  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Cargar metadata del video
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Manejar cambio en la barra de progreso
  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Manejar inicio de arrastre
  const handleProgressMouseDown = () => {
    setIsDragging(true);
  };

  // Manejar fin de arrastre
  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  // Auto-ocultar controles
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Manejar movimiento del mouse
  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Auto-play cuando cambia el src
  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [src, autoPlay]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Calcular progreso
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative w-full h-full group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        playsInline
        onClick={togglePlay}
      />

      {/* Overlay para play/pause en el centro */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: showControls ? 1 : 0, transition: "opacity 0.3s" }}
      >
        <button
          onClick={togglePlay}
          className="pointer-events-auto bg-black/60 hover:bg-black/80 text-white rounded-full p-4 sm:p-6 transition-all transform hover:scale-110 backdrop-blur-sm"
        >
          {isPlaying ? <Pause size={32} className="sm:w-12 sm:h-12" /> : <Play size={32} className="sm:w-12 sm:h-12 ml-1" />}
        </button>
      </div>

      {/* Controles inferiores */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 sm:p-4 rounded-b-xl transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        {/* Barra de progreso */}
        <div className="relative w-full h-1 bg-white/20 rounded-full mb-3 group/progress cursor-pointer">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            onMouseDown={handleProgressMouseDown}
            onMouseUp={handleProgressMouseUp}
            onTouchStart={handleProgressMouseDown}
            onTouchEnd={handleProgressMouseUp}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* Thumb visible al hover */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"
            style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>

        {/* Controles inferiores */}
        <div className="flex items-center justify-between text-white">
          {/* Play/Pause y Mute */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="hover:bg-white/10 p-1.5 sm:p-2 rounded-full transition"
            >
              {isPlaying ? <Pause size={20} className="sm:w-6 sm:h-6" /> : <Play size={20} className="sm:w-6 sm:h-6" />}
            </button>
            <button
              onClick={toggleMute}
              className="hover:bg-white/10 p-1.5 sm:p-2 rounded-full transition"
            >
              {isMuted ? <VolumeX size={20} className="sm:w-6 sm:h-6" /> : <Volume2 size={20} className="sm:w-6 sm:h-6" />}
            </button>
          </div>

          {/* Tiempo */}
          <div className="text-xs sm:text-sm font-medium tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;