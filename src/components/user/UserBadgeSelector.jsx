import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserBadgeSelector({
  badges = [],
  onToggle,
}) {
  // 🟡 EMPTY STATE
  if (!badges.length) {
    return (
      <div className="pt-6 text-center space-y-4">
        <div className="text-4xl">🎖️</div>

        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Aún no has comprado insignias
        </p>

        <Link
          to="/games/store"
          className="inline-block px-4 py-2 rounded-xl 
          bg-emerald-500 text-white text-sm font-medium
          hover:bg-emerald-600 transition shadow-sm"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* HEADER */}
      <div className="space-y-1">
        <h3 className="font-bold dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Mis Insignias
        </h3>

        <p className="text-xs text-gray-500">
          Toca para equipar o desequipar en tu perfil
        </p>
      </div>

      {/* GRID */}
      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => {
          const isEquipped = badge.is_equipped;

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => onToggle(badge.id, isEquipped)}
              //title={badge.name}
              className={`group relative flex items-center justify-center
                w-16 h-16 rounded-2xl border transition-all duration-200
                active:scale-90

                ${
                  isEquipped
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-70 hover:opacity-100"
                }

                hover:scale-105 hover:-translate-y-0.5 hover:shadow-md
              `}
            >
              {/* CONTENT */}
              {badge.category === "badge" ? (
                <span className="text-2xl select-none">
                  {badge.icon}
                </span>
              ) : (
                <img
                  src={badge.url}
                  alt={badge.name}
                  className="w-8 h-8 object-contain rounded-md"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}

              {/* CHECK */}
              {isEquipped && (
                <div
                  className="absolute -top-2 -right-2 
                  bg-emerald-500 text-white 
                  rounded-full p-1 
                  border-2 border-white dark:border-black
                  shadow"
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              )}

              {/* TOOLTIP */}
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2
                opacity-0 group-hover:opacity-100
                pointer-events-none
                transition-all duration-200
                bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap"
              >
                {badge.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}