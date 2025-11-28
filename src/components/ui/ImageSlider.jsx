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
        console.log(data);
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

  // Función para renderizar grid de imágenes basado en la cantidad
  const renderImageGrid = (images, isPreview = false) => {
    if (images.length === 0) return null;

    const gridClass =
      {
        1: "grid-cols-1",
        2: "grid-cols-2 gap-2",
        3: "grid-cols-2 gap-2",
        4: "grid-cols-2 gap-2",
        5: "grid-cols-3 gap-2",
        6: "grid-cols-3 gap-2",
      }[images.length] || "grid-cols-2 gap-2";

    return (
      <div className={`grid ${gridClass} mt-3`}>
        {images.map((preview, index) => (
          <div
            key={index}
            className={`relative ${
              images.length === 3 && index === 0 ? "col-span-2 row-span-1" : ""
            } ${images.length === 4 && index >= 2 ? "col-span-1" : ""}`}
          >
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className={`w-full rounded-lg object-cover ${
                images.length === 1
                  ? "max-h-96"
                  : images.length === 2
                  ? "h-48"
                  : images.length === 3 && index === 0
                  ? "h-64"
                  : "h-32"
              } ${isPreview ? "cursor-default" : "cursor-pointer"}`}
            />
            
          </div>
        ))}
      </div>
    );
  };

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
            <LinkPreview url={linkUrl} />
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

          {renderImageGrid(images)}
          {/* IMAGENES EN GRID  */}
          {images.length > 0 && (
            <div className="mb-3">
              {/* 1 IMAGEN – Se muestra grande como ahora */}
              {images.length === 1 && (
                <img
                  src={images[0].image_url}
                  className="w-full max-h-[400px] object-cover rounded-xl cursor-pointer"
                  onClick={() => openModal(0)}
                />
              )}

              {/* 2 A 4 IMÁGENES – GRID AL ESTILO CREATEPOST */}
              {images.length > 1 && images.length <= 4 && (
                <div className="grid grid-cols-2 gap-1">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.image_url}
                        className="w-full h-40 object-cover rounded-xl cursor-pointer"
                        onClick={() => openModal(index)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* MÁS DE 4 IMÁGENES – GRID LIMITADO + OVERLAY */}
              {images.length > 4 && (
                <div className="grid grid-cols-2 gap-2 relative">
                  {images.slice(0, 4).map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.image_url}
                        className="w-full h-40 object-cover rounded-xl cursor-pointer"
                        onClick={() => openModal(index)}
                      />

                      {/* Overlay en la última imagen */}
                      {index === 3 && (
                        <div
                          className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                          onClick={() => openModal(3)}
                        >
                          +{images.length - 4}
                        </div>
                      )}
                    </div>
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
