import { Code2 } from "lucide-react";

const DevBadge = ({ variant = "default" }) => {
  return (
    <div
      className="
        group relative inline-flex items-center gap-2 px-3 py-1.5 
        rounded-full font-medium text-xs
        bg-indigo-500/10 dark:bg-indigo-400/10
        text-indigo-600 dark:text-indigo-300
        border border-indigo-500/20 dark:border-indigo-400/20
        backdrop-blur-md
        shadow-sm
        hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/20
        transition-all duration-300
        hover:scale-105
      "
    >
      {/* Glow effect */}
      <span className="absolute inset-0 rounded-full bg-indigo-500/10 opacity-0 group-hover:opacity-100 blur-md transition" />

      {/* Icon */}
      <Code2 size={14} className="relative z-10" />

      {/* Text */}
      <span className="relative z-10 tracking-wide">
        this.developer
      </span>
    </div>
  );
};

export default DevBadge;