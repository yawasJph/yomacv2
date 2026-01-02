const OpenGraphCard = ({ og_data }) => {
  if (!og_data || !og_data.url) return null;

  const hostname = new URL(og_data.url).hostname;

  return (
    <a
      href={og_data.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col sm:flex-row w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-all duration-200 mb-4 no-underline shadow-sm"
    >
      {/* CONTENEDOR DE IMAGEN */}
      {og_data.image && (
        <div className="relative w-full sm:w-32 md:w-40 h-40 sm:h-auto shrink-0 overflow-hidden bg-gray-100 dark:bg-neutral-800">
          <img
            src={og_data.image}
            alt={og_data.title || "Preview"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      {/* CONTENIDO TEXTUAL */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">
        <div className="flex-1 ">
          {og_data.publisher && (
            <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 truncate">
              {og_data.publisher}
            </span>
          )}

          {og_data.title && (
            <h3 className="text-[14px] md:text-base font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
              {og_data.title}
            </h3>
          )}

          {og_data.description && (
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-[13px] line-clamp-2 mt-1.5 leading-relaxed">
              {og_data.description}
            </p>
          )}
        </div>

        {/* FOOTER: LOGO + HOSTNAME */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-50 dark:border-neutral-800">
          {og_data.logo ? (
            <img src={og_data.logo} alt="" className="w-3.5 h-3.5 rounded-sm object-contain" />
          ) : (
            <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-neutral-700 rounded-sm" />
          )}
          <span className="text-[11px] font-medium text-gray-400 dark:text-neutral-500 lowercase truncate">
            {hostname}
          </span>
        </div>
      </div>
    </a>
  );
};

export default OpenGraphCard;