import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const formatTime = (time) => {
  if (!time) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export default function ModernVideoPlayer({ src, autoPlay = true }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimeout = useRef(null)

  const startHideTimer = () => {
  clearTimeout(hideTimeout.current)

  hideTimeout.current = setTimeout(() => {
    setShowControls(false)
  }, 2500)
}


  useEffect(() => {
  if (videoRef.current && autoPlay) {
    videoRef.current.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }
}, [autoPlay])

  // ▶️ Play / Pause
  const togglePlay = () => {
  if (videoRef.current.paused) {
    videoRef.current.play()
    setIsPlaying(true)
    startHideTimer()
  } else {
    videoRef.current.pause()
    setIsPlaying(false)
    setShowControls(true)
  }
}

const handleMouseMove = () => {
  setShowControls(true)
  if (playing) startHideTimer()
}


  // 🔊 Mute
  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  // ⏱️ Progress Sync (SUPER SUAVE)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf;

    const update = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 📏 Metadata
  const handleLoaded = () => {
    setDuration(videoRef.current.duration);
  };

  // 🎯 SCRUB PROGRESS
  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
  };

  // 👻 Auto hide controls
  useEffect(() => {
    if (!playing) return;

    const timeout = setTimeout(() => setShowControls(false), 2000);//
    return () => clearTimeout(timeout);
  }, [playing, progress]);

  const showUI = () => setShowControls(true);

  console.log(showControls)
  return (
    <div
      className="relative w-full h-full group"
      onMouseMove={handleMouseMove}
      onTouchStart={showUI}
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        onLoadedMetadata={handleLoaded}
        onClick={togglePlay}
        className="w-full h-full object-contain rounded-xl"
        onEnded={() => setPlaying(false)}

        
      />

      {/* CONTROLS */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />

        {/* PROGRESS BAR */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="relative h-1.5 mx-4 mb-2 bg-white/30 rounded-full cursor-pointer"
        >
          <div
            className="absolute h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* CONTROLS ROW */}
        <div className="flex items-center justify-between px-4 pb-4 text-white">
          <div className="flex items-center gap-3">
            {/* PLAY */}
            <button
              onClick={togglePlay}
              className="bg-black/50 p-2 rounded-full backdrop-blur-md hover:scale-110 transition"
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* TIME */}
            <span className="text-sm font-semibold tracking-wide">
              {formatTime(videoRef.current?.currentTime)} /{" "}
              {formatTime(duration)}
            </span>
          </div>

          {/* MUTE */}
          <button
            onClick={toggleMute}
            className="bg-black/50 p-2 rounded-full backdrop-blur-md hover:scale-110 transition"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
