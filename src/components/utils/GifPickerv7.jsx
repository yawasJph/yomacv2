import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { useGifInfinityQuery } from "@/hooks/tenor/useGifInfinityQuery";
import { CATEGORIES } from "@/consts/tenor/categories";
import { GifItem } from "../gif/GifItem";
import { CategoryButton } from "../gif/CategoryButton";
import { useGifPickerLogic } from "@/hooks/tenor/useGifPickerLogic";

export default function GifPicker({ onSelect, onClose }) {
 // const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("trending");
  //const inputRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useGifInfinityQuery(activeCategory);
    
 // const loadMoreRef = useRef(null);
    const {
    searchTerm,
    setSearchTerm,
    loadMoreRef,
    handleSelect,
    handleCategoryClick
  } = useGifPickerLogic(onSelect, onClose, hasNextPage, isFetchingNextPage, fetchNextPage);

  const allGifs = data?.pages.flatMap((page) => page.results) || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center z-1000 p-0 md:p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-[85vh] md:h-[600px] animate-in slide-in-from-bottom duration-300 overflow-hidden">
        <div className="p-4 border-b dark:border-neutral-800 space-y-4">

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black dark:text-white flex items-center gap-2 text-indigo-500">
              <TrendingUp className="w-5 h-5" /> GIFs
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors active:scale-90"
            >
              <X className="w-5 h-5 dark:text-neutral-400" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
             // ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && setActiveCategory(searchTerm || "trending")
              }
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <CategoryButton
                key={cat.id}
                cat={cat}
                isActive={activeCategory === cat.id}
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {status === "pending" ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 gap-3 space-y-3">
              {allGifs.map((gif, index) => (
                <GifItem
                  key={`${gif.id}-${index}`}
                  gif={gif}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="animate-spin text-indigo-500" />
            )}
          </div>
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
