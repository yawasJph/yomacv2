import React, { useState, useRef, useEffect } from "react";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import FullscreenModal from "./FullscreenModal";
import { timeAgoTiny } from "../../utils/timeagoTiny";
import { timeAgoLong } from "../../utils/timeAgoLong";
import { useIsMobile } from "../../../hooks/useIsMobile";
import UserHoverCard from "./UserHoverCard";
import PostImages from "./PostImages";
import OpenGraphCard from "../openGraph/OpenGraphCard";
import ImageModal from "./ImageModal";

const CardPost = ({ post, images }) => {
  // const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  const openModal = (index) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
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
                <>
                  Ver menos <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Ver más <ChevronDown size={16} />
                </>
              )}
            </button>
          )}

          {/* LINK PREVIEW CARD */}
          {post.og_data && <OpenGraphCard og_data={post.og_data} />}

          {/* 2. VIDEO (Nuevo ✨) */}
          {post.video && (
            <div className="mt-2 rounded-xl overflow-hidden bg-black aspect-video sm:aspect-auto sm:max-h-[500px] flex justify-center items-center shadow-sm border border-gray-100 dark:border-gray-800">
              <video
                src={post.video}
                controls
                preload="metadata"
                className="w-full h-full max-h-[500px] object-contain"
                // poster={post.video + '#t=0.1'} // Truco opcional para generar thumbnail
              />
            </div>
          )}

          <PostImages images={images} onOpen={openModal} />
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
        // images={images}
        // currentIndex={currentIndex}
        //setCurrentIndex={setCurrentIndex}
      >
        {isModalOpen && (
          <ImageModal
            closeModal={closeModal}
            images={images}
            initialIndex={selectedIndex}
          />
        )}
      </FullscreenModal>
    </article>
  );
};

export default CardPost;
