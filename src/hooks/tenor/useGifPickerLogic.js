import { useState, useEffect, useRef, useCallback } from "react";

export function useGifPickerLogic(onSelect, onClose, hasNextPage, isFetchingNextPage, fetchNextPage) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("trending");
  const loadMoreRef = useRef(null);
  const inputRef = useRef(null);

  // Lógica de Selección
  const handleSelect = useCallback((urls) => {
    onSelect(urls);
    onClose();
  }, [onSelect, onClose]);

  // Lógica de Categorías
  const handleCategoryClick = useCallback((id) => {
    setActiveCategory(id);
    setSearchTerm("");
  }, []);

  // Intersection Observer para Infinite Scroll
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
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    loadMoreRef,
    inputRef,
    handleSelect,
    handleCategoryClick
  };
}