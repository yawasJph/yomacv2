import { memo } from "react";

export const CategoryButton = memo(({ cat, isActive, onClick }) => (
  <button
    onClick={() => onClick(cat.id)}
    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
      isActive
        ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 dark:text-white hover:bg-indigo-50 hover:dark:bg-indigo-700/30"
    }`}
  >
    <span>{cat.icon}</span>
    {cat.label}
  </button>
));
CategoryButton.displayName = "CategoryButton";