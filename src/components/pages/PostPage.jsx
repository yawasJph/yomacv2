import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ImageIcon, Smile, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useComments } from "../../hooks/useComments";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../../supabase/supabaseClient";
import CardPost from "../ui/feed/CardPost";
import SkeletonPost from "../skeletons/SkeletonPost";
import { useProfile } from "../../hooks/useProfile";
import GifPicker from "../utils/GifPickerv8";
import CommentItem from "../ui/CommentItem";
import { useAuthAction } from "../../hooks/useAuthAction";
import { notify } from "@/utils/toast/notifyv3";
import EmojiSelector from "../emoji/EmojiSelector";

const MAX_CHARS = 500;

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const { data } = useProfile(user?.id);
  const {} = useAuthAction();
  const { executeAction } = useAuthAction();

  const openAuthModalForComment = () => { 
    executeAction(
      () => {
        // Si el usuario está autenticado, no hacemos nada
      },
      "comentar",
      () => {
        // Si el usuario cancela o cierra el modal, podemos mostrar un mensaje o simplemente no hacer nada
        // Por ejemplo, podríamos mostrar una alerta (aunque lo ideal sería un toast o algo menos intrusivo)
        notify.info("Necesitas iniciar sesión para comentar.");
      }
    );  
  };  

  // 1. Cargar el post principal
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("posts_with_counts")
        //.select("*, profiles:user_id(*,equpipped_badges:user_badges(is_equipped,badges(icon,name))), post_media(*)")
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
        badges ( icon, name, category, resource_url )
      )
    ),
    post_media (id, media_url, media_type)
  `,
        )
        .filter("profiles.user_badges.is_equipped", "eq", true)
        .eq("id", postId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // 2. Lógica de comentarios
  const {
    data: commentsData,
    isLoading: commentsLoading,
    addComment,
    hasNextPage,
    fetchNextPage,
  } = useComments(postId);

  const allComments = commentsData?.pages.flat() || [];

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() && !selectedGif) return;

    addComment({
      content: newComment,
      userId: user.id,
      gifUrl: selectedGif?.gifUrl,
      postId: postId,
    });
    //queryClient.invalidateQueries({ queryKey: ["post", postId] });
    setNewComment("");
    setSelectedGif(null);
    setShowEmoji(false);
  };

  const onEmojiClick = (emojiData) => {
    setNewComment((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const hanldeNextComments = () => {
    executeAction(fetchNextPage, "ver mas comentarios",
      () => { 
        notify.info("Necesitas iniciar sesión para ver más comentarios.");  
      }
    );
  };

  if (postLoading) return <SkeletonPost />;

  console.log(selectedGif)

  return (
    <div className="bg-white dark:bg-black pb-24 min-h-screen">
      {/* HEADER */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 flex items-center gap-6 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate("/");
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">Publicación</h1>
      </div>

      {/* POST PRINCIPAL */}
      {post && <CardPost post={post} media={post.post_media} isDetailedView />}

      {/* CAJA DE COMENTARIOS */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        {user ? (
          <form onSubmit={handleSendComment}>
            <div className="flex gap-3">
              <img
                src={data?.avatar}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  maxLength={MAX_CHARS}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Postea tu respuesta"
                  className="w-full bg-transparent dark:text-white resize-none outline-none text-lg"
                  rows={3}
                  name="input-comment"
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
           
            {showGif && (
              <GifPicker
                onSelect={(url) => setSelectedGif(url)}
                onClose={() => setShowGif(false)}
              />
            )}
          </form>
        ) : (
          <div className="text-center py-12 px-4">
            {/* <h3 className="text-xl font-bold text-gray-800 dark:text-indigo-100 mb-2">
              Iniciar Sesion
            </h3> */}
            <p className="text-gray-500 dark:text-gray-300/70 mb-6 max-w-md mx-auto">
              Debes iniciar sesion para escribir un comentario
            </p>
            <button
              onClick={openAuthModalForComment}
              className="px-6 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-emerald-indigo/25 transition-all duration-300 dark:from-emerald-600 dark:to-emerald-500 hover:scale-100"
            >
              Iniciar Sesion
            </button>
          </div>
        )}
      </div>

      {/* LISTA DE COMENTARIOS */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800 pb-65">
        {allComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={post.id} />
        ))}

        {hasNextPage && (
          <button
            onClick={hanldeNextComments}
            className="w-full py-4 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
          >
            Mostrar más respuestas
          </button>
        )}

        {allComments.length == 0 && (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400 text-sm ">
            No hay comentarios
          </div>
        )}

        {!hasNextPage && allComments.length > 0 && (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400 text-sm ">
            No hay más comentarios
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;
