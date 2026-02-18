import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

// Función de fetch para Tenor
const fetchTenorGifs = async ({
  pageParam = "",
  query = "trending",
  apiKey,
}) => {
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
  const loadMoreRef = useRef(null); // Ref para el detector de scroll

  const API_KEY = import.meta.env.VITE_TENOR_API_KEY;

  // 1. React Query para manejar el estado y el cache
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["tenorGifs", activeCategory],
      queryFn: ({ pageParam }) =>
        fetchTenorGifs({
          pageParam,
          query: activeCategory,
          apiKey: API_KEY,
        }),
      getNextPageParam: (lastPage) => lastPage.next || undefined,
      staleTime: 1000 * 60 * 10, // Cache de 10 minutos
    });

  const allGifs = data?.pages.flatMap((page) => page.results) || [];

  // 2. Intersection Observer para el Infinite Scroll Automático
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }, // Se dispara cuando el 50% del detector es visible
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 3. Scroll Lock (el que ya tenías)
  useEffect(() => {
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setActiveCategory(searchTerm || "trending");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center z-1000 p-0 md:p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[600px] animate-in slide-in-from-bottom duration-300">
        {/* Header y Buscador */}
        <div className="p-4 border-b dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black dark:text-white flex items-center gap-2 text-indigo-500">
              <TrendingUp className="w-5 h-5" /> GIFs de Tenor
            </h3>
            <button
              onClick={onClose}
              className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full"
            >
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
              placeholder="Buscar GIF..."
              //className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-neutral-100 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Grid de GIFs */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {status === "pending" ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
          ) : (
            <>
              <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                {allGifs.map((gif, index) => (
                  <div
                    key={`${gif.id}-${index}`} // Key única combinada
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
                      className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              {/* Elemento Detector para cargar más */}
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isFetchingNextPage ? (
                  <Loader2 className="animate-spin text-indigo-500" />
                ) : hasNextPage ? (
                  <span className="text-xs text-neutral-500">
                    Cargando más...
                  </span>
                ) : (
                  <span className="text-xs text-neutral-500">
                    Fin de los resultados
                  </span>
                )}
              </div>
            </>
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
