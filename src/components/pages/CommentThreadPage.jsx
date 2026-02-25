import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Smile, X, ImageIcon } from "lucide-react";
import CommentItem from "../ui/CommentItem";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useComments } from "../../hooks/useComments";
import { useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import GifPicker from "../utils/GifPickerv8";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import EmojiSelector from "../emoji/EmojiSelector";
// Importa tus componentes...

const CommentThreadPage = () => {
  const MAX_CHARS = 500;
  const { commentId } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const { user } = useAuth();
  const { data: currentUserProfiles } = useProfile(user?.id);
  const queryClient = useQueryClient()

  // 1. Necesitas un fetch del comentario padre específicamente
  const { data: parentComment, isLoading } = useQuery({
    queryKey: ["comment_detail", commentId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("comments_with_counts")
      //   .select(
      //     `
      //   *,
      //   profiles:user_id (
      //     id, 
      //     full_name, 
      //     avatar, 
      //     carrera, 
      //     ciclo
      //   )
      // `
      //   )
       .select(
       `
    *,
    profiles:user_id (
      id, 
      full_name, 
      avatar, 
      carrera, 
      ciclo,
      equipped_badges:user_badges ( 
        is_equipped,
        badges ( icon, name )
      )
    )
  `
      )
         .filter("profiles.user_badges.is_equipped", "eq", true)
        .eq("id", commentId)
        .single();

      if (error) {
        console.error("Error de Supabase:", error.message);
        throw error;
      }
      return data;
    },
    enabled: !!commentId, // Solo ejecuta si el ID existe
  });

  // 2. Obtener las respuestas (las tratamos como comentarios de este commentId)
  const { data: replies, addComment, fetchNextPage, hasNextPage} = useComments(commentId, "comment");

  const handleSendComment = (e) => {
    e.preventDefault();

    if (!newComment.trim() && !selectedGif) return;
    if (!user) return; // Seguridad

    addComment({
      content: newComment,
      userId: user.id,
      postId: parentComment.post_id, // El post original donde nació el hilo
      parentId: commentId, // El ID del comentario que estamos respondiendo
      gifUrl: selectedGif?.gifUrl,
    });

    setNewComment("");
    setSelectedGif(null);
    setShowEmoji(false);
  };

  const onEmojiClick = (emojiData) => {
    setNewComment((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  if (isLoading) return <div>Cargando hilo...</div>;
  if (!parentComment) return <div>No se encontró el comentario.</div>;

  return (
    <div className="bg-white dark:bg-black pb-20">{/* max-h-screen */}
      {/* Header Superior */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 flex items-center gap-6 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">Hilo</h1>
      </div>

      {/* El Comentario Padre destacado */}
      <div className="border-b dark:border-gray-800 bg-emerald-50/30 dark:bg-emerald-500/5">
        {parentComment && (
          <CommentItem comment={parentComment} isParentView={true} isDetailedView/>
        )}
      </div>

      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSendComment}>
          <div className="flex gap-3">
            <img
              src={currentUserProfiles?.avatar}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-gray-500 text-sm mb-1">
                Respondiendo a{" "}
                <span className="text-emerald-500">
                  @
                  {parentComment.profiles?.full_name
                    .replace(/\s+/g, "")
                    .toLowerCase()}
                </span>
              </p>
              <textarea
                maxLength={MAX_CHARS}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Postea tu respuesta"
                className="w-full bg-transparent dark:text-white resize-none outline-none text-lg"
                rows={3}
              />

              {/* Previsualización del GIF seleccionado */}
              {selectedGif && (
                <div className="relative mt-2 inline-block">
                  <img
                    src={selectedGif.gifUrl}
                    className="h-40 rounded-xl border dark:border-gray-700"
                  />
                  <button
                    onClick={() => setSelectedGif(null)}
                    className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2 text-emerald-500">
                  <EmojiSelector addEmoji={onEmojiClick}/>
                  <button
                    type="button"
                    onClick={() => setShowGif(true)}
                    className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>
                {/* Indicador de caracteres */}
                <div className="flex justify-end items-center gap-4 ">
                  <span
                    className={`text-xs ${
                      newComment.length >= MAX_CHARS
                        ? "text-red-500 font-bold"
                        : "text-gray-400"
                    }`}
                  >
                    {newComment.length} / {MAX_CHARS}
                  </span>
                  <button
                    disabled={
                      (!newComment.trim() && !selectedGif) ||
                      newComment.length > MAX_CHARS
                    }
                    className="bg-emerald-500 text-white px-4 py-1.5 rounded-full font-bold disabled:opacity-50"
                  >
                    Responder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {showGif && (
          <GifPicker
            onSelect={(url) => setSelectedGif(url)}
            onClose={() => setShowGif(false)}
          />
        )}
      </div>

      {/* Lista de respuestas */}
      <div className="divide-y divide-gray-100 dark:divide-gray-600 pb-88">
        {replies?.pages.map((page) =>
          page.map((reply) => <CommentItem key={reply.id} comment={reply} />)
        )}
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="w-full py-4 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
          >
            Mostrar más respuestas
          </button>
        )}

        {replies?.length == 0 && 
        (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400 text-sm ">
            No hay comentarios
          </div>
        )}

        {!hasNextPage && replies?.length > 0 && (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400 text-sm ">
            No hay más comentarios
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentThreadPage;
