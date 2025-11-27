import React from "react";

const OGCard = ({ meta, url }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full max-w-2xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-neutral-800/30 transition-all duration-300 overflow-hidden border border-gray-200 dark:border-neutral-700 hover:scale-[1.02] active:scale-[1.01] mb-4"
    >
         {/* Contenedor de imagen con relación de aspecto */}
      {meta.image && (
        <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-neutral-800">
           <img 
            src={meta.image} 
            alt={meta.title || "Preview image"}
            className="w-full h-full object-cover transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
        {/* Contenido */}
      <div className="p-4 md:p-5">
        {/* Sitio web */}
      {meta.site && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {meta.site}
            </p>
          </div>
        )}
        {/* Título */}
        {meta.title && (
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 leading-tight">
            {meta.title}
          </h3>
        )}
        {/* Descripción */}
        {meta.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
            {meta.description}
          </p>
        )}
        {/* URL del enlace */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800 break-all">         
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate break-all">
              {meta.site}
            </p>
          </div>
      </div>
    </a>
  );
};

export default OGCard;
