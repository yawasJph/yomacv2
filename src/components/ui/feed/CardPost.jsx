import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Flag,
  Trash2,
  Share,
  Repeat2,
} from "lucide-react";
import FullscreenModal from "./FullscreenModal";
import { timeAgoTiny } from "../../utils/timeagoTiny";
import { timeAgoLong } from "../../utils/timeAgoLong";
import { useIsMobile } from "../../../hooks/useIsMobile";
import OpenGraphCard from "../openGraph/OpenGraphCard2";
import PostMedia from "./PostMedia";
import MediaModal from "./MediaModal";
import UserHoverCard from "./UserHoverCardv2";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useAuthAction } from "../../../hooks/useAuthAction";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { useDeletePost } from "../../../hooks/useDeletePost";
import { toast } from "sonner";
import ConfirmModal from "../ConfirmModal";
import ReportModal from "../ReportModal";
import { handleShare } from "../../utils/sharePost";
import RenderTextWithLinks from "../../utils/RenderTextWithLinks";
import RepostButton from "../RepostButton";

const CardPost = ({ post, media, isDetailedView = false, tab }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  const { executeAction } = useAuthAction();
  const isMobile = useIsMobile();
  const { user: currentUser } = useAuth();
  const isMe = currentUser?.id === post.profiles.id;
  const navigate = useNavigate();

  const [showOptions, setShowOptions] = useState(false);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const optionsRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReport = () => {
    setShowOptions(false);
    setIsReportModalOpen(true);
  };

  // Función que se ejecuta al confirmar en el modal
  const confirmDelete = () => {
    deletePost(post.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false); // Cerramos el modal al terminar
      },
      
    });
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

  const handleComment = () => {
    executeAction(() => {
      navigate(`/post/${post.id}`);
    }, "escribir un comentario");
  };

  const c = (e) => {
    if (post.content.length < 1000) {
      setExpanded(!expanded);
      e.stopPropagation();
    }
  };

   const goToPost = () => {
    // Si ya estamos en la vista detallada, no hacemos nada
    if (isDetailedView) return;
    // Evitamos que navegue si el usuario está seleccionando texto
    const selection = window.getSelection();
    if (selection.toString().length > 0) return;
    navigate(`/post/${post.id}`);
  };

  return (
    <article
      onClick={goToPost}
      className={`px-4 py-4 sm:px-6 transition-colors border-b border-gray-100 dark:border-gray-800 
        ${
          !isDetailedView
            ? "hover:bg-gray-200/50 dark:hover:bg-gray-700/20 cursor-pointer"
            : ""
        }`}
    >
      {/* INDICADOR DE REPOST - Solo aparece si isRepostView es true */}
      {tab === "reposts" && (
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-2 pb-1 text-gray-500 dark:text-gray-400">
          <Repeat2 size={14} className="stroke-[3px]" />
          <span className="text-[13px] font-bold hover:underline cursor-default">
            Repostaste
          </span>
        </div>
      )}
      <div className="flex gap-3 items-start">
        {/* Avatar */}
        <div onClick={(e) => e.stopPropagation()}>
          {isMe ? (
            <img
              src={post.profiles.avatar || "/default-avatar.jpg"}
              alt="avatar"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <Link to={`/profile/${post.profiles.id}`}>
              <img
                src={post.profiles.avatar || "/default-avatar.jpg"}
                alt="avatar"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
              />
            </Link>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 w-0">
          {/* Header */}
          {/* Header del Post */}
          <div className="flex flex-col mb-2">
            <div className="flex justify-between items-start">
              {/* Columna 1: Nombre, carrera y ciclo */}
              <div className="flex flex-col flex-1 min-w-0 pr-2">
                <div className="flex items-start justify-between min-w-0">
                  {/* Contenedor del nombre que puede crecer */}
                  <div
                    className="flex-1 min-w-0 pr-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base wrap-break-word">
                      {isMobile ? (
                        <span className="hover:underline">
                          {post.profiles.full_name}
                        </span>
                      ) : !isMe ? (
                        <UserHoverCard user={post.profiles}>
                          <span className="hover:underline cursor-pointer">
                            {post.profiles.full_name}
                          </span>
                        </UserHoverCard>
                      ) : (
                        <span>{post.profiles.full_name}</span>
                      )}
                    </h3>
                  </div>

                  {/* Columna 2: Tiempo del post - se mueve según el largo del nombre */}
                  <span
                    className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-500 font-medium whitespace-nowrap p-1.5 shrink-0"
                    title={new Date(post.created_at).toLocaleString("es-PE")}
                  >
                    {isMobile
                      ? timeAgoTiny(post.created_at)
                      : timeAgoLong(post.created_at)}
                  </span>
                </div>

                {/* Carrera y ciclo */}
                <div className="flex gap-1 items-center">
                  {post.profiles.carrera && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                      {post.profiles.carrera}
                    </span>
                  )}
                  {post.profiles.ciclo && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-700">
                      Ciclo {post.profiles.ciclo}
                    </span>
                  )}
                </div>
              </div>

              <div
                onClick={(e) => e.stopPropagation()}
                className="relative"
                ref={optionsRef}
              >
                <button
                  onClick={() => {
                    setShowOptions(!showOptions);
                  }}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0 ml-2"
                >
                  <MoreHorizontal size={18} />
                </button>

                {showOptions && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isMe ? (
                      <button
                        onClick={() => {
                          setIsDeleteModalOpen(true); // Abrimos el modal en vez de usar confirm()
                          setShowOptions(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span className="font-medium">Eliminar post</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleReport}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Flag size={16} />
                        <span className="font-medium">Reportar contenido</span>
                      </button>
                    )}

                    {/* Botón extra que siempre es útil */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/post/${post.id}`
                        );
                        toast.success("Enlace copiado");
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800"
                    >
                      <AlertCircle size={16} />
                      <span className="font-medium">Copiar enlace</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Texto del Post */}
          <p
            ref={textRef}
            className={`text-base text-gray-900 dark:text-gray-100 mb-2 whitespace-pre-wrap wrap-break-word ${
              expanded || isDetailedView ? "line-clamp-none" : "line-clamp-6"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <RenderTextWithLinks text={post.content}/>
          </p>
          {isTruncated && (
            <button
              onClick={c}
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
          <div onClick={(e) => e.stopPropagation()}>
            {/* LINK PREVIEW CARD */}
            {post.og_data && <OpenGraphCard og_data={post.og_data} />}

            <PostMedia media={media} onOpen={openModal} />
          </div>

          {/* Acciones */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-6 text-gray-500 dark:text-gray-400 mt-3"
          >
            <LikeButton postId={post.id} initialCount={post.like_count} />

            <button
              className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={handleComment}
            >
              <MessageCircle size={20} />
              <span className="text-sm">{post.comment_count || 0}</span>
            </button>

            <RepostButton postId={post.id} initialReposts={post.repost_count}/>

            <BookmarkButton postId={post.id} />

            {/* SHARE */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare(post);
              }}
              className="flex items-center gap-2 hover:text-emerald-500 transition-colors group"
            >
              <div className="p-2 group-hover:bg-emerald-500/10 rounded-full">
                <Share size={19} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL FULLSCREEN (Fuera del flujo visual del post, pero dentro del componente) */}
      <FullscreenModal isOpen={isModalOpen} onClose={closeModal}>
        {isModalOpen && (
          <MediaModal
            media={media}
            closeModal={closeModal}
            initialIndex={selectedIndex}
          /> //media
        )}
      </FullscreenModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar publicación?"
        message="Esta acción no se puede deshacer. Se borrará de tu perfil, de la cronología de cualquier cuenta que te siga y de los resultados de búsqueda."
        isLoading={isDeleting}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={post.id}
      />
    </article>
  );
};

export default CardPost;
