import { memo } from "react";

export const GifItem = memo(({ gif, onSelect }) => (
  <div
    className="relative group cursor-pointer overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 break-inside-avoid"
    onClick={() =>
      onSelect({
        gifUrl: gif.images.original.url,
        // Usamos original_still o fixed_width_still como fallback para la imagen estática
        staticUrl: gif.images.original_still?.url || gif.images.fixed_width_still?.url,
      })
    }
  >
    <img
      // fixed_width es ideal para diseños de columnas/masonry
      src={gif.images.fixed_width.url} 
      alt={gif.title || "GIF"}
      className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
  </div>
));

GifItem.displayName = "GifItem";