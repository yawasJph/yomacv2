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

import { supabaseClient } from "../../supabase/supabaseClient";
import LinkPreview from "../../og/LinkPreview ";

const ImageSlider = ({ post, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const scrollContainerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [urlMeta, setUrlMeta] = useState(null);
  const [linkUrl, setLinkUrl] = useState(null);

  const isMobile = useIsMobile();

  // Detectar primer URL
  const extractFirstUrl = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  // Renderizar texto con los links transformados en <a>
  const renderTextWithLinks = (text) => {
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
    const url = extractFirstUrl(post.content);
    if (!url) return;

    setLinkUrl(url);
    const fetchMetadata = async () => {
      try {
        const { data, error } = await supabaseClient.functions.invoke(
          "hyper-task",
          { body: { url } }
        );
        if (!error) setUrlMeta(data);
        console.log(data)
      } catch (e) {
        console.error(e);
      }
    };

    fetchMetadata();
  }, [post.content]);

  // Detecta automáticamente si el texto está siendo truncado
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Si el texto real es mayor al área visible => truncado
    setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [post.content]);

  console.log(post);
  // Mínima distancia para considerar un swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      goToNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      goToPrevious();
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Resetear índice cuando cambian las imágenes
  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length]);

  console.log(urlMeta)
  console.log(linkUrl)

  return (
    <article className="px-4 py-4 sm:px-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
      <div className="flex gap-3 items-start">
        {/* Avatar */}
        <img
          src={post.profiles.avatar || "/default-avatar.jpg"}
          alt="avatar"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
        />

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 justify-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base wrap-break-word">
                {isMobile ? (
                  <span className="">{post.profiles.full_name}</span>
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
                title={new Date(post.created_at).toLocaleString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "short",
                })}
              >
                {isMobile
                  ? timeAgoTiny(post.created_at)
                  : timeAgoLong(post.created_at)}
              </p>
            </div>

            <button className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition cursor-pointer">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Texto */}
          {/* Texto */}
          <p
            ref={textRef}
            className={`text-base text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-wrap break-all transition-all duration-200 ${
              expanded ? "line-clamp-none" : "line-clamp-6"
            }`}
          >
            {renderTextWithLinks(post.content)}
          </p>

          {/* Botón solo si realmente se truncó */}
          {isTruncated && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:underline font-medium pb-3"
            >
              {expanded ? (
                <>
                  Ver menos <ChevronUp size={18} />
                </>
              ) : (
                <>
                  Ver más <ChevronDown size={18} />
                </>
              )}
            </button>
          )}

          {/* LINK PREVIEW CARD */}
          
          {urlMeta && linkUrl && (
            <LinkPreview url={linkUrl}/>
            // <a
            //   href={urlMeta?.url || linkUrl}
            //   target="_blank"
            //   rel="noopener noreferrer"
            //   className="block border rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 
            //    hover:bg-gray-200 dark:hover:bg-gray-800 transition mb-4"
            // >
            //   {/* Imagen OG */}
            //   {urlMeta.image && (
            //     <img
            //       src={urlMeta.image}
            //       className="w-full h-52 object-cover border-b dark:border-gray-800"
            //     />
            //   )}

            //   {/* Texto */}
            //   <div className="p-3">
            //     <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2">
            //       {urlMeta.title || "Ver enlace"}
            //     </h3>

            //     {urlMeta.description && (
            //       <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">
            //         {urlMeta.description}
            //       </p>
            //     )}

            //     {urlMeta.site && (
            //       <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            //         {urlMeta.site}
            //       </p>
            //     )}
            //   </div>
            // </a>
          )}

          {/* SLIDER DE IMÁGENES */}
          {images.length > 0 && (
            <div className="mb-3 relative group">
              <div
                ref={scrollContainerRef}
                className="relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                  height: "400px", // ALTURA FIJA PARA EVITAR SALTOS
                }}
              >
                {/* Contenedor interno */}
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                    height: "100%",
                  }}
                >
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className="min-w-full h-full flex justify-center items-center bg-black/5 dark:bg-white/5"
                    >
                      <img
                        src={img.image_url}
                        alt={`post ${index + 1}`}
                        className="max-h-full max-w-full object-contain cursor-pointer"
                        draggable="false"
                        onClick={() => openModal(index)}
                      />
                    </div>
                  ))}
                </div>

                {/* BOTÓN ANTERIOR */}
                {images.length > 1 && currentIndex > 0 && (
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 dark:bg-white/50 hover:bg-black/70 dark:hover:bg-white/70 text-white dark:text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}

                {/* BOTÓN SIGUIENTE */}
                {images.length > 1 && currentIndex < images.length - 1 && (
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 dark:bg-white/50 hover:bg-black/70 dark:hover:bg-white/70 text-white dark:text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}
              </div>

              {/* INDICADORES */}
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all rounded-full ${
                        index === currentIndex
                          ? "w-3 h-3 bg-emerald-600 dark:bg-emerald-400"
                          : "w-2 h-2 bg-gray-400 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 🚀 MODAL FULLSCREEN */}
          <FullscreenModal
            isOpen={isModalOpen}
            onClose={closeModal}
            images={images}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          >
            {isModalOpen && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-9999"
                onClick={closeModal}
              >
                {/* Contenedor */}
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Imagen fullscreen */}
                  <img
                    src={images[currentIndex].image_url}
                    className="max-w-full max-h-full object-contain"
                  />

                  {/* Botón cerrar */}
                  <button
                    onClick={closeModal}
                    className="absolute top-5 right-5 text-white bg-black/30 hover:bg-black/70 p-2 rounded-full dark:bg-gray-600 dark:hover:bg-gray-800"
                  >
                    <X />
                  </button>

                  {/* Flecha izquierda */}
                  {images.length > 1 && (
                    <button
                      onClick={goToPrevious}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full"
                    >
                      <ChevronLeft size={28} />
                    </button>
                  )}

                  {/* Flecha derecha */}
                  {images.length > 1 && (
                    <button
                      onClick={goToNext}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full"
                    >
                      <ChevronRight size={28} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </FullscreenModal>

          {/* Acciones */}
          <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
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
    </article>
  );
};

export default ImageSlider;
