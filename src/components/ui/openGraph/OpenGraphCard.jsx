import React from 'react'

const OpenGraphCard = ({og_data}) => {
  return (
    <a
    href={og_data.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 mb-4"
  >
    <div className="flex-1 p-3 flex flex-col justify-center">
      {og_data.publisher && (
        <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1 line-clamp-1">
          {og_data.publisher}
        </p>
      )}

      {og_data.title && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">
          {og_data.title}
        </h3>
      )}

      {og_data.description && (
        <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mt-1">
          {og_data.description}
        </p>
      )}

      {og_data.url && (
        <div className="flex items-center gap-2 mt-2">
          {og_data.logo && (
            <img src={og_data.logo} className="w-4 h-4 rounded-sm" />
          )}
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {new URL(og_data.url).hostname}
          </span>
        </div>
      )}
    </div>

    {og_data.image && (
      <div className="w-35 md:w-44 min-h-24 shrink-0 bg-gray-200 dark:bg-neutral-800 overflow-hidden">
        <img
          src={og_data.image}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
    )}
  </a>
  )
}

export default OpenGraphCard