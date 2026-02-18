import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

const CATEGORIES = [
  { id: "trending", label: "Tendencias", icon: "🔥" },
  { id: "funny", label: "Risa", icon: "😂" },
  { id: "love", label: "Amor", icon: "❤️" },
  { id: "reaction", label: "Reacción", icon: "😮" },
  { id: "dance", label: "Baile", icon: "💃" },
  { id: "sad", label: "Triste", icon: "😢" },
  { id: "cat", label: "Gatos", icon: "🐱" },
];

const fetchTenorGifs = async ({ pageParam = "", query = "trending", apiKey }) => {
  const isTrending = query === "trending" || !query;
  const endpoint = isTrending ? "featured" : "search";
  const url = `https://tenor.googleapis.com/v2/${endpoint}?q=${query}&key=${apiKey}&limit=20&pos=${pageParam}&contentfilter=medium`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar GIFs");
  return res.json();
};

export default function GifPicker({ onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("trending");
  const inputRef = useRef(null);
  const loadMoreRef = useRef(null);
  
  const API_KEY = import.meta.env.VITE_TENOR_API_KEY;

  // 1. React Query para manejar datos y caché
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["tenorGifs", activeCategory],
    queryFn: ({ pageParam }) => fetchTenorGifs({ 
      pageParam, 
      query: activeCategory, 
      apiKey: API_KEY 
    }),
    getNextPageParam: (lastPage) => lastPage.next || undefined,
    staleTime: 1000 * 60 * 10,
  });

  const allGifs = data?.pages.flatMap((page) => page.results) || [];

  // 2. Intersection Observer para carga automática
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 3. Scroll Lock Profesional
  useEffect(() => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  // Manejadores
  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    setSearchTerm(""); // Limpiamos el buscador al usar categorías
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setActiveCategory(searchTerm || "trending");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center z-1000 p-0 md:p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[600px] animate-in slide-in-from-bottom duration-300">
        
        {/* Header y Filtros */}
        <div className="p-4 border-b dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black dark:text-white flex items-center gap-2 text-indigo-500">
              <TrendingUp className="w-5 h-5" /> GIFs de Tenor
            </h3>
            <button onClick={onClose} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full active:scale-90 transition-transform">
              <X className="w-5 h-5 dark:text-neutral-400" />
            </button>
          </div>
          
          {/* Input de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="¿Qué buscas?..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Categorías (Scroll Horizontal) */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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

        {/* Grid de Contenido */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {status === "pending" ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : (
            <>
              <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                {allGifs.map((gif, index) => (
                  <div 
                    key={`${gif.id}-${index}`}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 break-inside-avoid"
                    onClick={() => onSelect({ 
                      gifUrl: gif.media_formats.gif.url, 
                      staticUrl: gif.media_formats.gifpreview?.url 
                    })}
                  >
                    <img
                      src={gif.media_formats.tinygif.url}
                      alt={gif.content_description}
                      className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              {/* Detector de Scroll Infinito */}
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isFetchingNextPage ? (
                  <Loader2 className="animate-spin text-indigo-500" />
                ) : hasNextPage ? (
                  <span className="text-xs text-neutral-500 font-medium">Cargando más magia...</span>
                ) : (
                  <span className="text-xs text-neutral-500">Llegaste al final 🏁</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="py-2 bg-neutral-50 dark:bg-neutral-800/50 text-center border-t dark:border-neutral-800">
          <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
            Powered by <span className="text-indigo-500">Tenor</span>
          </span>
        </div>
      </div>
    </div>
  );
}