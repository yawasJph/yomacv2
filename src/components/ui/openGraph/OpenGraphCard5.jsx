import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const OpenGraphCard = ({ og_data, onclose, isLoading }) => {
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false); // 👈 preview siempre visible
  const [imgLoaded, setImgLoaded] = useState(false);

  if (isLoading) {
    return (
      <div className="mt-4 p-3 border border-gray-100 dark:border-neutral-800 rounded-xl flex items-center gap-3 animate-pulse">
        <div className="h-16 w-16 bg-gray-200 dark:bg-neutral-800 rounded-md"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!og_data?.url) return null;

  let hostname = "";
  try {
    hostname = new URL(og_data.url).hostname.replace("www.", "");
  } catch {
    hostname = og_data.url;
  }

  // Lazy only when used in feed
  useEffect(() => {
    if (onclose) return; // preview no necesita observer

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [onclose]);

  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <div ref={cardRef} className="relative mt-3">
      
      {/* CLOSE BUTTON */}
      {onclose && (
        <button
          onClick={onclose}
          className="absolute -top-2 right-0 bg-gray-900 text-white p-1 rounded-full z-20 shadow-md lg:opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={12} />
        </button>
      )}

      <a
        href={og_data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-all duration-200 shadow-sm active:scale-[0.99]"
      >
        {/* IMAGE */}
        <div className="relative w-28 sm:w-36 aspect-4/3 shrink-0 bg-gray-100 dark:bg-neutral-800 overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700" />
          )}

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
          <div className="flex-1">
            {og_data.publisher && (
              <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate">
                {og_data.publisher}
              </span>
            )}

            {og_data.title && (
              <h3 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                {og_data.title}
              </h3>
            )}

            {og_data.description && (
              <p className="text-gray-500 dark:text-gray-400 text-[11px] line-clamp-2 mt-1">
                {og_data.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <img
              src={og_data.logo || favicon}
              alt=""
              className="w-3 h-3 rounded-sm object-contain"
            />
            <span className="text-[10px] text-gray-400 truncate">
              {hostname}
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default OpenGraphCard;
