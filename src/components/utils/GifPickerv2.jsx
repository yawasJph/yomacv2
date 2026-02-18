import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react"; // Asumiendo que usas lucide-react

export default function GifPicker({ onSelect, onClose }) {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  const API_KEY = import.meta.env.VITE_TENOR_API_KEY;

  const fetchGifs = async (q = "trending") => {
    setLoading(true);
    try {
      const endpoint = q === "trending" ? "featured" : "search";
      const res = await fetch(
        `https://tenor.googleapis.com/v2/${endpoint}?q=${q}&key=${API_KEY}&limit=30&contentfilter=medium`
      );
      const data = await res.json();
      setGifs(data.results || []);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs();
    inputRef.current?.focus(); // Auto-focus al abrir
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      fetchGifs(searchTerm || "trending");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-[600px]">
        
        {/* Header con Buscador */}
        <div className="p-4 border-b dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold dark:text-white">Seleccionar GIF</h3>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <X className="w-6 h-6 dark:text-neutral-400" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Buscar en Tenor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-neutral-100 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Contenedor de GIFs */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-2 text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Buscando...</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 gap-2 space-y-2">
              {gifs.map((gif) => (
                <div 
                  key={gif.id}
                  className="relative group cursor-pointer overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800 break-inside-avoid"
                  onClick={() => {
                    const gifUrl = gif.media_formats.gif.url;
                    const staticUrl = gif.media_formats.gifpreview?.url || gif.media_formats.tinygifpreview?.url;
                    onSelect({ gifUrl, staticUrl });
                    onClose();
                  }}
                >
                  <img
                    src={gif.media_formats.tinygif.url}
                    alt={gif.content_description}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Overlay sutil al pasar el mouse */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          )}
          
          {!loading && gifs.length === 0 && (
            <div className="text-center py-10 text-neutral-500">
              No encontramos nada para "{searchTerm}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 border-t dark:border-neutral-800 text-center">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Powered by Tenor</p>
        </div>
      </div>
    </div>
  );
}