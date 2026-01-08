import useTilt3D from "../../hooks/useTilt3D";


export default function BadgeIcon({ icon, name, rare = false }) {
  const { ref, handleMouseMove, reset } = useTilt3D();

  return (
    <span
      ref={ref}
      title={name}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className={`
        inline-flex items-center justify-center
        size-8 rounded-lg
        bg-neutral-100 dark:bg-neutral-800
        text-lg
        shadow-sm
        cursor-default

        animate-[badge-in_.25s_ease-out]
        transition-transform duration-150 ease-out
        will-change-transform

        ${rare ? "animate-[badge-glow_2s_ease-in-out_infinite]" : ""}
      `}
    >
      {icon}
    </span>
  );
}
