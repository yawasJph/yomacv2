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
  const containerRef = useRef(null);

  // Formatear tiempo (segundos a mm:ss)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle play/pause
  const togglePlay = (e) => {
    e?.stopPropagation();
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
  const toggleMute = (e) => {
    e?.stopPropagation();
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
    setShowControls(true);
  };

  // Manejar fin de arrastre
  const handleProgressMouseUp = () => {
    setIsDragging(false);
    resetControlsTimeout();
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

  // Manejar movimiento del mouse (Desktop)
  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Manejar toque en pantalla (Mobile)
  const handleTouchStart = (e) => {
    // Solo toggle controles si se toca el área del video (no los controles)
    if (e.target === containerRef.current || e.target === videoRef.current) {
      if (showControls) {
        // Si los controles están visibles, mantenerlos y resetear timeout
        resetControlsTimeout();
      } else {
        // Si están ocultos, mostrarlos
        setShowControls(true);
        resetControlsTimeout();
      }
    }
  };

  // Auto-play cuando cambia el src
  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {
        // Si falla el autoplay, asegurar que el estado sea correcto
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [src, autoPlay]);

  // Iniciar timeout cuando el video empieza a reproducirse
  useEffect(() => {
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying]);

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
      ref={containerRef}
      className="relative w-full h-full group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={handleTouchStart}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
      />

      {/* Overlay para play/pause en el centro - Solo visible cuando está pausado o controles visibles */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          !isPlaying || showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={togglePlay}
          className={`pointer-events-auto bg-black/60 hover:bg-black/80 active:bg-black/90 text-white rounded-full p-4 sm:p-6 transition-all transform hover:scale-110 active:scale-95 backdrop-blur-sm ${
            !isPlaying ? "scale-100" : showControls ? "scale-100" : "scale-0"
          }`}
        >
          {isPlaying ? (
            <Pause size={32} className="sm:w-12 sm:h-12" />
          ) : (
            <Play size={32} className="sm:w-12 sm:h-12 ml-1" />
          )}
        </button>
      </div>

      {/* Controles inferiores */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 rounded-b-xl transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* Barra de progreso */}
        <div 
          className="relative w-full h-1.5 sm:h-1 bg-white/20 rounded-full mb-3 group/progress cursor-pointer"
          onClick={(e) => {
            // Permitir click directo en la barra
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            const newTime = percentage * duration;
            if (videoRef.current) {
              videoRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all pointer-events-none"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleProgressChange}
            onMouseDown={handleProgressMouseDown}
            onMouseUp={handleProgressMouseUp}
            onTouchStart={handleProgressMouseDown}
            onTouchEnd={handleProgressMouseUp}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* Thumb visible al hover/touch */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3 sm:h-3 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg pointer-events-none"
            style={{ 
              left: `${progress}%`, 
              transform: "translate(-50%, -50%)",
              opacity: isDragging ? 1 : undefined
            }}
          />
        </div>

        {/* Controles inferiores */}
        <div className="flex items-center justify-between text-white">
          {/* Play/Pause y Mute */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="hover:bg-white/10 active:bg-white/20 p-2 sm:p-2 rounded-full transition touch-manipulation"
            >
              {isPlaying ? (
                <Pause size={22} className="sm:w-6 sm:h-6" />
              ) : (
                <Play size={22} className="sm:w-6 sm:h-6" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="hover:bg-white/10 active:bg-white/20 p-2 sm:p-2 rounded-full transition touch-manipulation"
            >
              {isMuted ? (
                <VolumeX size={22} className="sm:w-6 sm:h-6" />
              ) : (
                <Volume2 size={22} className="sm:w-6 sm:h-6" />
              )}
            </button>
          </div>

          {/* Tiempo */}
          <div className="text-xs sm:text-sm font-medium tabular-nums bg-black/30 px-2 py-1 rounded">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;