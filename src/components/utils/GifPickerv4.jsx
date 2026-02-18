import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchTenorGifs } from "@/hooks/tenor/fecthTenorApi";

export default function GifPicker({ onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("trending");
  const inputRef = useRef(null);
  const API_KEY = import.meta.env.VITE_TENOR_API_KEY;

  // React Query: Manejo de cache e infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status
  } = useInfiniteQuery({
    queryKey: ["tenorGifs", activeCategory],
    queryFn: ({ pageParam }) => fetchTenorGifs({ 
      pageParam, 
      query: activeCategory, 
      apiKey: API_KEY 
    }),
    getNextPageParam: (lastPage) => lastPage.next || undefined,
    staleTime: 1000 * 60 * 10, // Cache por 10 minutos
  });

  // Aplanamos los resultados de todas las páginas
  const allGifs = data?.pages.flatMap((page) => page.results) || [];

  // ... (Efecto de Scroll Lock que ya tenías)

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setActiveCategory(searchTerm || "trending");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center z-1000 p-0 md:p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[600px] animate-in slide-in-from-bottom duration-300">
        
        {/* BUSCADOR Y CATEGORÍAS (Igual que antes) */}
        <div className="p-4 border-b dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> GIFs de Tenor
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all">
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
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-neutral-100 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* GRID CON INFINITE SCROLL */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {status === "pending" ? (
            <div className="h-full flex flex-col items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : (
            <>
              <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                {allGifs.map((gif) => (
                  <div 
                    key={gif.id}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 break-inside-avoid"
                    onClick={() => onSelect({ gifUrl: gif.media_formats.gif.url, staticUrl: gif.media_formats.gifpreview?.url })}
                  >
                    <img
                      src={gif.media_formats.tinygif.url}
                      className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              {/* BOTÓN O TRIGGER DE "CARGAR MÁS" */}
              <div className="mt-6 pb-4 text-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                  className="text-sm font-bold text-indigo-500 hover:text-indigo-600 disabled:text-neutral-500"
                >
                  {isFetchingNextPage ? "Cargando más..." : hasNextPage ? "Ver más GIFs" : "Es todo por ahora"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}