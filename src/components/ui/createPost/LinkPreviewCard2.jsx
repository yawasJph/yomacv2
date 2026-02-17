const OpenGraphCard = ({ preview, isLoading, onClose }) => {
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

  if (!preview) return null;

  let hostname = "";
  try {
    hostname = new URL(preview.url).hostname.replace("www.", "");
  } catch {
    hostname = preview.url;
  }

  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <div className="relative mt-3">
      <button
        onClick={onClose}
        className="absolute -top-2 right-0 bg-gray-900 text-white p-1 rounded-full z-20 shadow-md"
      >
        ✕
      </button>

      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-all duration-200 shadow-sm"
      >
        {/* IMAGE */}
        <div className="relative w-28 sm:w-36 aspect-4/3 shrink-0 bg-gray-100 dark:bg-neutral-800 overflow-hidden">
          {!preview.image && (
            <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-neutral-700" />
          )}

          {preview.image && (
            <img
              src={preview.image}
              alt={preview.title || "Preview"}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>

        {/* TEXT */}
        <div className="flex flex-col flex-1 min-w-0 px-3 py-2">
          <div className="flex-1">
            {preview.publisher && (
              <span className="text-[9px] font-semibold text-blue-600 uppercase truncate">
                {preview.publisher}
              </span>
            )}

            {preview.title && (
              <h3 className="text-[13px] font-semibold line-clamp-2">
                {preview.title}
              </h3>
            )}

            {preview.description && (
              <p className="text-gray-500 text-[11px] line-clamp-2 mt-1">
                {preview.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <img
              src={preview.logo || favicon}
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
