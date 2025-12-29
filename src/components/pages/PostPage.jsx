import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useComments } from "../../hooks/useComments";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../../supabase/supabaseClient";
import CardPost from "../ui/feed/CardPost";
import SkeletonPost from "../skeletons/SkeletonPost";
import { useProfile } from "../../hooks/useProfile";

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");

  const {data} = useProfile(user.id)

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
    fetchNextPage 
  } = useComments(postId);

  const allComments = commentsData?.pages.flat() || [];

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment({ content: newComment, userId: user.id });
    setNewComment("");
  };

  if (postLoading) return <SkeletonPost />;

  console.log(data)

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-24">
      {/* HEADER */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 flex items-center gap-6 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full">
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">Publicación</h1>
      </div>

      {/* POST PRINCIPAL */}
      {post && <CardPost post={post} media={post.post_media} isDetailedView />}

      {/* CAJA DE COMENTARIOS */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSendComment} className="flex gap-3">
          <img src={data?.avatar} className="w-10 h-10 rounded-full object-cover" />
          
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Postea tu respuesta"
              className="w-full bg-transparent dark:text-white resize-none outline-none text-lg"
              rows={4}
            />
           
            <div className="flex justify-end mt-2">
              <button 
                disabled={!newComment.trim()}
                className="bg-emerald-500 text-white px-4 py-1.5 rounded-full font-bold disabled:opacity-50"
              >
                Responder
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* LISTA DE COMENTARIOS */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {allComments.map((comment) => (
          <div key={comment.id} className="p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
            <img src={comment.profiles.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold dark:text-white text-sm">{comment.profiles.full_name}</span>
                <span className="font-bold dark:text-white text-sm">{comment.profiles.carrera}</span>
                <span className="font-bold dark:text-white text-sm">{comment.profiles.ciclo}</span>
                <span className="text-gray-500 text-xs">· {new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-800 dark:text-gray-200 mt-1 text-[15px]">{comment.content}</p>
            </div>
          </div>
        ))}
        
        {hasNextPage && (
          <button onClick={() => fetchNextPage()} className="w-full py-4 text-emerald-500 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-500/5">
            Mostrar más respuestas
          </button>
        )}
      </div>
    </div>
  );
};

export default PostPage;