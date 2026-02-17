import { useEffect, useRef, useState } from "react";

const OpenGraphCard = ({ og_data }) => {
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!og_data?.url) return null;

  let hostname = "";
  try {
    hostname = new URL(og_data.url).hostname.replace("www.", "");
  } catch {
    hostname = og_data.url;
  }

  // 🔥 Lazy render when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  // 🔥 favicon fallback automático
  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <a
      ref={cardRef}
      href={og_data.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-all duration-200 mb-3 no-underline shadow-sm active:scale-[0.99]"
    >
      {/* IMAGE */}
      <div className="relative w-28 sm:w-36 aspect-4/3 shrink-0 bg-gray-100 dark:bg-neutral-800 overflow-hidden">
        {/* Skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700" />
        )}

        {/* Lazy Image */}
        {visible && og_data.image && (
          <img
            src={og_data.image}
            alt={og_data.title || "Preview"}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      {/* TEXT */}
      <div className="flex flex-col flex-1 min-w-0 px-3 py-2">
        <div className="flex-1 min-w-0">
          {og_data.publisher && (
            <span className="block text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5 truncate">
              {og_data.publisher}
            </span>
          )}

          {og_data.title && (
            <h3 className="text-[13px] sm:text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
              {og_data.title}
            </h3>
          )}

          {og_data.description && (
            <p className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs line-clamp-2 mt-1 leading-snug">
              {og_data.description}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <img
            src={og_data.logo || favicon}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-3 h-3 rounded-sm object-contain"
          />

          <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500 truncate">
            {hostname}
          </span>
        </div>
      </div>
    </a>
  );
};

export default OpenGraphCard;
