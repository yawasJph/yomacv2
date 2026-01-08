import useTilt3D from "../../hooks/useTilt3D";


export default function BadgeMedia({ src, name, rare = false }) {
  const { ref, handleMouseMove, reset } = useTilt3D();

  return (
    <div
      ref={ref}
      title={name}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className={`
        size-8 rounded-lg overflow-hidden
        bg-neutral-100 dark:bg-neutral-800
        shadow-sm

        animate-[badge-in_.3s_ease-out]
        transition-transform duration-150 ease-out
        will-change-transform

        ${rare ? "animate-[badge-glow_2s_ease-in-out_infinite]" : ""}
      `}
    >
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
    </div>
  );
}
