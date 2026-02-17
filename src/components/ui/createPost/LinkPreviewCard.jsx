// 📦 components/LinkPreviewCard.jsx
import React from "react";
import { X } from "lucide-react";

const LinkPreviewCard = ({ preview, isLoading, onClose }) => {
  if (isLoading) {
    return (
      <div className="mt-4 p-3 border border-gray-100 dark:border-neutral-800 rounded-xl flex items-center gap-3 animate-pulse">
        <div className="skeleton h-16 w-16 bg-gray-200 dark:bg-neutral-800 rounded-md"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 bg-gray-200 dark:bg-neutral-800 rounded w-3/4"></div>
          <div className="skeleton h-3 bg-gray-200 dark:bg-neutral-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!preview) return null;

  // Renderizado de la tarjeta de preview (tu JSX original)

  return (
    <div className="relative mt-8 group">
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 bg-gray-900 text-white p-1 rounded-full z-20 shadow-md lg:opacity-0 group-hover:opacity-100 transition-opacity"
        title="Cerrar previsualización"
      >
        <X size={12} />
      </button>

      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        // className="flex w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 mb-4"
        className="group flex w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-all duration-200 mb-3 no-underline shadow-sm active:scale-[0.99] overflow-hidden"
      >
        {preview.image && (
          <div
            //className="w-30 md:w-44 min-h-24 shrink-0 bg-gray-200 dark:bg-neutral-800 overflow-hidden"
            className="relative w-28 sm:w-36 aspect-4/3 shrink-0 bg-gray-100 dark:bg-neutral-800 overflow-hidden"
          >
            <img
              src={preview.image}
              alt="Preview"
              //className="w-full h-full object-cover"
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* <div className="flex-1 p-3 flex flex-col justify-center">
          {preview.publisher && (
            <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1 line-clamp-1">
              {preview.publisher}
            </p>
          )}

          {preview.title && (
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">
              {preview.title}
            </h3>
          )}

          {preview.description && (
            <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mt-1">
              {preview.description}
            </p>
          )}

          {preview.url && (
            <div className="flex items-center gap-2 mt-2">
              {preview.logo && (
                <img src={preview.logo} className="w-4 h-4 rounded-sm" />
              )}
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {new URL(preview.url).hostname}
              </span>
            </div>
          )}
        </div> */}
        <div className="flex flex-col flex-1 min-w-0 px-3 py-2">
          <div className="flex-1 min-w-0">
            {preview.publisher && (
              <span className="block text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5 truncate">
                {preview.publisher}
              </span>
            )}

            {preview.title && (
              <h3 className="text-[13px] sm:text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                {preview.title}
              </h3>
            )}

            {preview.description && (
              <p className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs line-clamp-2 mt-1 leading-snug">
                {preview.description}
              </p>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <img
              src={preview.logo || favicon}
              alt="Prevciew"
              loading="lazy"
              decoding="async"
              className="w-3 h-3 rounded-sm object-contain"
            />

            <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500 truncate">
               {new URL(preview.url).hostname}
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default LinkPreviewCard;
