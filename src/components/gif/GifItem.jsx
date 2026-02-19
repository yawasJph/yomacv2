import { memo } from "react";

export const GifItem = memo(({ gif, onSelect }) => (
  <div
    className="relative group cursor-pointer overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 break-inside-avoid"
    onClick={() =>
      onSelect({
        gifUrl: gif.media_formats.gif.url,
        staticUrl: gif.media_formats.gifpreview?.url,
      })
    }
  >
    <img
      src={gif.media_formats.tinygif.url}
      alt={gif.content_description}
      className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
  </div>
));

GifItem.displayName = "GifItem";