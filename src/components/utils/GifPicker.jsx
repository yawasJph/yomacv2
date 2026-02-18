import { useState, useEffect } from "react";

export default function GifPicker({ onSelect, onClose }) {
  const [gifs, setGifs] = useState([]);
  const [query, setQuery] = useState("trending");

  const API_KEY = import.meta.env.VITE_TENOR_API_KEY;

  const searchGifs = async (q) => {
    const res = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${q}&key=${API_KEY}&limit=25`,
    );
    const data = await res.json();
    setGifs(data.results);
  };

  // Inicial: trending
  useEffect(() => {
    searchGifs(query);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl w-[90%] max-w-xl p-4 shadow-lg">
        {/* Search input */}
        <input
          type="text"
          placeholder="Buscar GIF…"
          className="w-full mb-3 px-3 py-2 rounded-lg border dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 dark:text-white text-gray-700"
          onKeyDown={(e) => {
            if (e.key === "Enter") searchGifs(e.target.value);
          }}
        />

        {/* GIF Grid */}
        <div className="grid grid-cols-3 gap-2 max-h-[350px] overflow-y-auto">
          {gifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.media_formats?.tinygif?.url}
              className="rounded-lg cursor-pointer hover:opacity-80"
              onClick={() => {
                //onSelect(gif.media_formats.gif.url);
                const previewUrl =
                  gif.media_formats.gif_preview?.url ||
                  gif.media_formats.tinygif?.url;
                onSelect(previewUrl);
                onClose();
              }}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600  dark:text-white text-gray-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
