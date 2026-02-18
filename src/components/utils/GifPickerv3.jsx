import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, TrendingUp } from "lucide-react";

// Categorías sugeridas para el usuario
const CATEGORIES = [
  { id: "trending", label: "Tendencias", icon: "🔥" },
  { id: "funny", label: "Risa", icon: "😂" },
  { id: "love", label: "Amor", icon: "❤️" },
  { id: "reaction", label: "Reacción", icon: "😮" },
  { id: "dance", label: "Baile", icon: "💃" },
  { id: "sad", label: "Triste", icon: "😢" },
  { id: "cat", label: "Gatos", icon: "🐱" },
];

export default function GifPicker({ onSelect, onClose }) {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("trending");
  const inputRef = useRef(null);

  const API_KEY = import.meta.env.VITE_TENOR_API_KEY;

  const fetchGifs = async (q = "trending") => {
    setLoading(true);
    try {
      const isTrending = q === "trending";
      const endpoint = isTrending ? "featured" : "search";
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
    inputRef.current?.focus();
  }, []);

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    setSearchTerm(""); // Limpiar buscador al elegir categoría
    fetchGifs(id);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setActiveCategory(null);
      fetchGifs(searchTerm || "trending");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center z-100 p-0 md:p-4 pb-20 sm:pb-0">
      {/* Contenedor Principal: En móvil sale desde abajo (estilo Drawer) */}
      <div className="bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[600px] animate-in slide-in-from-bottom duration-300">
        
        {/* Header y Buscador */}
        <div className="p-4 border-b dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              GIFs de Tenor
            </h3>
            <button onClick={onClose} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full transition-transform active:scale-90">
              <X className="w-5 h-5 dark:text-neutral-400" />
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
              placeholder="¿Qué buscas?..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-neutral-100 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>

          {/* Categorías Rápidas (Scroll Horizontal) */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 dark:text-white hover:bg-indigo-50 hover:dark:bg-indigo-700/30"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de GIFs */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-neutral-500 font-medium">Cargando...</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 gap-3 space-y-3">
              {gifs.map((gif) => (
                <div 
                  key={gif.id}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 break-inside-avoid"
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
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branding Footer */}
        <div className="py-2 bg-neutral-50 dark:bg-neutral-800/50 text-center">
          <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
            Powered by <span className="text-indigo-500">Tenor</span>
          </span>
        </div>
      </div>
    </div>
  );
}