import React, { useState, useRef, useEffect } from "react";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import FullscreenModal from "../utils/FullscreenModal";
import { timeAgoTiny } from "../utils/timeagoTiny";
import { timeAgoLong } from "../utils/timeAgoLong";
import { useIsMobile } from "../../hooks/useIsMobile";
import UserHoverCard from "../utils/UserHoverCard";
import PostImages from "./PostImages";

const ImageSlider = ({ post, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  const isMobile = useIsMobile();

  // Renderizar texto con los links transformados en <a>
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline break-all"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [post.content]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length]);


  return (
    <article className="px-4 py-4 sm:px-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors border-b border-gray-100 dark:border-gray-800">
      <div className="flex gap-3 items-start">
        {/* Avatar */}
        <img
          src={post.profiles.avatar || "/default-avatar.jpg"}
          alt="avatar"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
        />

        {/* Contenido */}
        <div className="flex-1 min-w-0 w-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                {isMobile ? (
                  <span>{post.profiles.full_name}</span>
                ) : (
                  <UserHoverCard user={post.profiles}>
                    <span className="hover:underline cursor-pointer">
                      {post.profiles.full_name}
                    </span>
                  </UserHoverCard>
                )}
              </h3>

              <p
                className="text-sm text-gray-500 dark:text-gray-400"
                title={new Date(post.created_at).toLocaleString("es-PE")}
              >
                {isMobile
                  ? timeAgoTiny(post.created_at)
                  : timeAgoLong(post.created_at)}
              </p>
            </div>

            <button className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Texto */}
          <p
            ref={textRef}
            className={`text-base text-gray-900 dark:text-gray-100 mb-2 whitespace-pre-wrap break-all ${
              expanded ? "line-clamp-none" : "line-clamp-6"
            }`}
          >
            {renderTextWithLinks(post.content)}
          </p>

          {isTruncated && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:underline font-medium pb-2 text-sm"
            >
              {expanded ? (
                <>Ver menos <ChevronUp size={16} /></>
              ) : (
                <>Ver más <ChevronDown size={16} /></>
              )}
            </button>
          )}

          {/* LINK PREVIEW CARD */}
          {post.og_data && (
            <a
            href={post.og_data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 mb-4"
          >
            <div className="flex-1 p-3 flex flex-col justify-center">
              {post.og_data.publisher && (
                <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1 line-clamp-1">
                  {post.og_data.publisher}
                </p>
              )}
    
              {post.og_data.title && (
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">
                  {post.og_data.title}
                </h3>
              )}
    
              {post.og_data.description && (
                <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mt-1">
                  {post.og_data.description}
                </p>
              )}
    
              {post.og_data.url && (
                <div className="flex items-center gap-2 mt-2">
                  {post.og_data.logo && (
                    <img src={post.og_data.logo} className="w-4 h-4 rounded-sm" />
                  )}
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {new URL(post.og_data.url).hostname}
                  </span>
                </div>
              )}
            </div>
    
            {post.og_data.image && (
              <div className="w-35 md:w-44 min-h-24 shrink-0 bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                <img
                  src={post.og_data.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </a>
          )}

          <PostImages images={images} onOpen={openModal}/>
          {/* Renderizado de Imágenes UNIFICADO */}
          

          {/* Acciones */}
          <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 mt-3">
            <button className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
              <Heart
                size={20}
                className="group-hover:fill-emerald-600 dark:group-hover:fill-emerald-400"
              />
              <span className="text-sm">{post.like_count || 0}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <MessageCircle size={20} />
              <span className="text-sm">{post.comment_count || 0}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <Bookmark size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL FULLSCREEN (Fuera del flujo visual del post, pero dentro del componente) */}
      <FullscreenModal
        isOpen={isModalOpen}
        onClose={closeModal}
        images={images}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      >
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={closeModal}
          >
            <div
              className="relative w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[currentIndex].image_url}
                className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
                alt="Fullscreen"
              />

              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition"
              >
                <X size={24} />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 p-3 rounded-full transition"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 p-3 rounded-full transition"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </FullscreenModal>
    </article>
  );
};

export default ImageSlider;