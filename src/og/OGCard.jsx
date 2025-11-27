import React from "react";
import { useIsMobile } from "../hooks/useIsMobile";

const OGCard = ({ meta, url }) => {

    const {isMobile} = useIsMobile();
    
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 mb-4"
    >
      {/* Izquierda: Texto */}
      <div className="flex-1 p-3 flex flex-col justify-center">
        {meta.site && (
          <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1 line-clamp-1">
            {meta.site}
          </p>
        )}

        {meta.title && (
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">
            {meta.title}
          </h3>
        )}

        {meta.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {meta.description}
          </p>
        )}
      </div>

      {/* Derecha: Imagen */}
      {meta.image && (
        <div className="w-24 md:w-44 h-24 md:h-24 shrink-0 bg-gray-200 dark:bg-neutral-800 overflow-hidden">
          <img
            src={meta.image}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </a>
  );
};

export default OGCard;
