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

  // 🎯 Progress tracking (MUY importante)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setProgress((video.currentTime / video.duration) * 100);
  }, []);

  // 🎯 Toggle Play
  const togglePlay = useCallback(() => {
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

  // // 🎯 Toggle Mute
  // const toggleMute = useCallback(() => {
  //   const video = videoRef.current;
  //   video.muted = !video.muted;
  //   setMuted(video.muted);
  // }, []);

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
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover"
      />

      {/* CENTER PLAY BUTTON */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="bg-black/40 backdrop-blur-md border border-white/20 p-3 rounded-full">
            <Play size={24} className="text-white" fill="white" />
          </div>
        </button>
      )}

      {/* CONTROLS */}
      {/* <div
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
          isHover || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-3 py-2 bg-linear-to-t from-black/70 to-transparent"
        onClick={e=>e.stopPropagation()}>
          <button onClick={togglePlay} className="text-white">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button onClick={toggleMute} className="text-white">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div> */}

      {/* VIDEO TAG */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
        VIDEO
      </div>
    </div>
  );
};

export default UniversalFeedVideo;
