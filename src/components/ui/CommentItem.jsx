import { useEffect, useRef, useState } from "react";
import UserHoverCard from "./feed/UserHoverCardv2";
import { timeAgoTiny } from "../utils/timeagoTiny";
import { timeAgoLong } from "../utils/timeAgoLong";
import {
  Flag,
  MoreHorizontal,
  Trash2,
  Copy,
  MessageCircle,
} from "lucide-react";
import ImageModal from "./userProfile/ImageModal";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";
import { useDeleteComment } from "../../hooks/useDeleteComment";
import LikeButtonComment from "./LikeButtonComment";
import { useNavigate } from "react-router-dom";
import ReportModal from "./ReportModal";
import RenderTextWithLinks from "../utils/RenderTextWithLinks";

const CommentItem = ({ comment, postId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const LIMIT = 250; // Umbral para mostrar el "Ver más"
  const isMobile = useIsMobile();
  const [selectedImg, setSelectedImg] = useState(null);
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);

  const text = comment.content;
  const isLong = text.length > LIMIT;
  const displayedText = isExpanded ? text : text.slice(0, LIMIT);
  const optionsRef = useRef(null);
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutate: deleteComment, isLoading: isDeleting } = useDeleteComment(
    comment.post_id
  );

  const isMe = user?.id === comment.profiles.id;

  const contextType = comment.parent_id ? "comment" : "post";
  const contextId = comment.parent_id || comment.post_id || postId;

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
    // toast.info("Reporte enviado. Nuestro equipo lo revisará.");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(comment.content);
    toast.success("Copiado al portapapeles");
    setShowOptions(false);
  };

  const handleReplyNavigation = () => {
    navigate(`/comment/${comment.id}`);
  };

 // En el componente que lista los comentarios
useEffect(() => {
  const hash = window.location.hash;
  
  if (hash) {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.classList.add('bg-indigo-100', 'dark:bg-indigo-900/20'); // Resaltado temporal
    }
  }
}, [comment]);

  return (
    <>
      <div
        key={comment.id}
        className="p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-2 relative  "
        id={`comment-${comment.id}`}
      >
        {comment.parent_id && (
          <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />
        )}
        <img
          src={comment.profiles.avatar}
          className="w-10 h-10 rounded-full object-cover shrink-0 z-10"
        />
        <div className="flex-1">
          <div className="flex flex-col mb-2">
            <div className="flex justify-between items-start">
              {/* Columna 1: Nombre, carrera y ciclo */}
              <div className="flex flex-col flex-1 min-w-0 pr-2">
                <div className="flex items-start justify-between min-w-0">
                  {/* Contenedor del nombre que puede crecer */}
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base wrap-break-word">
                      {isMobile ? (
                        <span>{comment.profiles.full_name}</span>
                      ) : user?.id !== comment.profiles.id ? (
                        <UserHoverCard user={comment.profiles}>
                          <span className="hover:underline cursor-pointer">
                            {comment.profiles.full_name}
                          </span>
                        </UserHoverCard>
                      ) : (
                        <span>{comment.profiles.full_name}</span>
                      )}
                    </h3>
                  </div>

                  {/* Columna 2: Tiempo del post - se mueve según el largo del nombre */}
                  <span
                    className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-500 font-medium whitespace-nowrap p-1.5 shrink-0"
                    title={new Date(comment.created_at).toLocaleString("es-PE")}
                  >
                    {isMobile
                      ? timeAgoTiny(comment.created_at)
                      : timeAgoLong(comment.created_at)}
                  </span>
                </div>

                {/* Carrera y ciclo */}
                <div className="flex gap-1 items-center">
                  {comment.profiles.carrera && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                      {comment.profiles.carrera}
                    </span>
                  )}
                  {comment.profiles.ciclo && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-700">
                      Ciclo {comment.profiles.ciclo}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative" ref={optionsRef}>
                <button
                  onClick={() => {
                    setShowOptions(!showOptions);
                  }}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0 ml-2"
                >
                  <MoreHorizontal size={18} />
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-100">
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Copy size={14} /> Copiar texto
                    </button>
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
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-gray-800 dark:text-gray-200 mt-1 text-[15px] whitespace-pre-wrap wrap-break-word">
            <RenderTextWithLinks text={displayedText}/>
            {/* {displayedText} */}
            {isLong && !isExpanded && "..."}

            {isLong && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-emerald-500 hover:underline font-medium text-sm"
              >
                {isExpanded ? "Mostrar menos" : "Ver más"}
              </button>
            )}
          </div>
          {/* Mostrar GIF en el comentario si existe */}
          {comment.gif_url && (
            <img
              src={comment.gif_url}
              alt="comment-gif"
              className="mt-3 rounded-xl max-h-60 w-full object-cover border dark:border-gray-800"
              onClick={() => setSelectedImg(comment.gif_url)}
            />
          )}

          {/* ACCIONES DEL COMENTARIO */}
          <div className="flex items-center gap-5 mt-3 text-gray-500">
            <LikeButtonComment
              commentId={comment.id}
              contextId={contextId}
              contextType={contextType}
              initialCount={comment.like_count}
            />

            <button
              onClick={handleReplyNavigation}
              className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors group/reply"
            >
              <div className="p-1.5 group-hover/reply:bg-emerald-500/10 rounded-full">
                <MessageCircle size={16} />
              </div>
              <span className="text-xs">{comment.reply_count}</span>
            </button>
          </div>

          {/* Renderizar el Modal si hay una imagen seleccionada */}
          {selectedImg && (
            <ImageModal
              src={selectedImg}
              onClose={() => setSelectedImg(null)}
            />
          )}
        </div>

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => deleteComment(comment.id)}
          title="¿Eliminar comentario?"
          message="Esta acción no se puede deshacer."
          isLoading={isDeleting}
        />

        <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        commentId={comment.id}
      />
      </div>
    </>
  );
};

export default CommentItem;
