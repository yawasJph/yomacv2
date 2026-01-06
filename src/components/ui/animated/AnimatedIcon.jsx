// src/components/AnimatedIcon.jsx
export default function AnimatedIcon({
  src,
  size = 32,
  className = "",
}) {
  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={`
        pointer-events-none
        object-contain
        ${className}
      `}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
