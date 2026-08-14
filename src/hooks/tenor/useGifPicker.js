import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchGiphyGifs } from "@/utils/giphy/fetchGiphyGifs";



const API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

export function useGifPicker(onSelect, onClose) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("trending");
  const loadMoreRef = useRef(null);
  const inputRef = useRef(null);

  // 1. React Query (Capa de Datos adaptada a Giphy)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["giphyGifs", activeCategory],
    queryFn: ({ pageParam = 0 }) => fetchGiphyGifs({ 
      pageParam, 
      query: activeCategory, 
      apiKey: API_KEY 
    }),
    getNextPageParam: (lastPage) => {
      // Giphy usa total_count, count y offset para la paginación
      const { total_count, count, offset } = lastPage.pagination;
      const nextOffset = offset + count;
      return nextOffset < total_count ? nextOffset : undefined;
    },
    staleTime: 1000 * 60 * 10,
  });

  // Aplanamos los resultados (Giphy guarda los items en la propiedad 'data')
  const allGifs = data?.pages.flatMap((page) => page.data) || [];

  // 2. Manejadores de eventos (Memorizados)
  const handleSelect = useCallback((urls) => {
    onSelect(urls);
    onClose();
  }, [onSelect, onClose]);

  const handleCategoryClick = useCallback((id) => {
    setActiveCategory(id);
    setSearchTerm("");
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      setActiveCategory(searchTerm || "trending");
    }
  };

  // 3. Efectos (UI)
  
  // Intersection Observer
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

  // Scroll Lock
  useEffect(() => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  return {
    allGifs,
    status,
    isFetchingNextPage,
    searchTerm,
    setSearchTerm,
    activeCategory,
    loadMoreRef,
    inputRef,
    handleSelect,
    handleCategoryClick,
    handleSearchSubmit
  };
}