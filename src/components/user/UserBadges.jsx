import React from "react";

export default function UserBadges({ badges = [] }) {
  if (!badges.length) return null;

  return (
    <div className="flex items-center gap-0 flex-wrap">
      {badges.map((badge) => {
        const isEmoji = badge.category === "badge";

        return (
          <div
            key={badge.id}
            //title={badge.name}
            className="group relative"
          >
            {/* Badge container */}
            <div
              className={`flex items-center justify-center
              backdrop-blur-md 
              transition-all duration-200
              hover:scale-110 hover:-translate-y-0.5 
              ${isEmoji ? "size-9 text-lg" : "size-10 p-1"}`}
            >
              {isEmoji ? (
                <span className="select-none">{badge.icon}</span>
              ) : (
                <img
                  src={badge.url}
                  alt={badge.name}
                  className="object-contain w-full h-full rounded-md"
                  loading="lazy"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </div>

            {/* Tooltip custom */}
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2
              opacity-0 group-hover:opacity-100
              pointer-events-none
              transition-all duration-200
              bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap"
            >
              {badge.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}