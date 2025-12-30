import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImageIcon,
  Smile,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useComments } from "../../hooks/useComments";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../../supabase/supabaseClient";
import CardPost from "../ui/feed/CardPost";
import SkeletonPost from "../skeletons/SkeletonPost";
import { useProfile } from "../../hooks/useProfile";
import EmojiPicker from "emoji-picker-react";
import GifPicker from "../utils/GifPicker";
import CommentItem from "../ui/CommentItem";

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const { data } = useProfile(user?.id);
  const MAX_CHARS = 500;

  // 1. Cargar el post principal
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("posts_with_counts")
        .select("*, profiles:user_id(*), post_media(*)")
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
      gifUrl: selectedGif,
    });

    setNewComment("");
    setSelectedGif(null);
  };

  const onEmojiClick = (emojiData) => {
    setNewComment((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  if (postLoading) return <SkeletonPost />;

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-24">
      {/* HEADER */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 flex items-center gap-6 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
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
              />
              

              {/* Previsualización del GIF seleccionado */}
              {selectedGif && (
                <div className="relative mt-2 inline-block">
                  <img
                    src={selectedGif}
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
                  <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full"
                  >
                    <Smile size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGif(true)}
                    className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>

                {/* <button
                  disabled={!newComment.trim() && !selectedGif}
                  className="bg-emerald-500 text-white px-5 py-1.5 rounded-full font-bold disabled:opacity-50"
                >
                  {isMobile ? <Send size={20} /> : "Responder"}
                </button> */}
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

        {/* Pickers Flotantes/Modales */}
        {showEmoji && (
          <div className="absolute z-50 mt-2">
            <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
          </div>
        )}
        {showGif && (
          <GifPicker
            onSelect={(url) => setSelectedGif(url)}
            onClose={() => setShowGif(false)}
          />
        )}
      </div>

      {/* LISTA DE COMENTARIOS */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {allComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment}/>
        ))}

        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="w-full py-4 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
          >
            Mostrar más respuestas
          </button>
        )}

        {allComments.length == 0 && 
        (
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
