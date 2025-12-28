import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabaseClient } from "../../../supabase/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { useAuthAction } from "../../../hooks/useAuthAction";

const LikeButton = ({ postId, initialLikes = 0 }) => {
  const { user } = useAuth();
  const { executeAction } = useAuthAction();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isAnimating, setIsAnimating] = useState(false);

  // 1. Verificar si el usuario ya dio like al cargar el componente
  useEffect(() => {
    if (!user) return;

    const checkLikeStatus = async () => {
      const { data } = await supabaseClient
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (data) setIsLiked(true);
    };

    checkLikeStatus();
  }, [postId, user]);

  const toggleLike = async () => {
    executeAction(async () => {
      try {
        // --- Lógica Optimista ---
        const previousLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(!previousLiked);
        setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);
        if (!previousLiked) setIsAnimating(true); // Efecto de explosión

        // --- Petición Real ---
        if (previousLiked) {
          // Quitar Like
          await supabaseClient
            .from("likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", user.id);
        } else {
          // Dar Like
          await supabaseClient
            .from("likes")
            .insert({ post_id: postId, user_id: user.id });
        }
      } catch (error) {
        // Si falla, revertimos al estado anterior
        setIsLiked(isLiked);
        setLikesCount(likesCount);
        console.error("Error toggling like:", error);
      } finally {
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, "dar me gusta");
  };

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-2 transition-colors group ${
        isLiked 
          ? "text-emerald-500" 
          : "text-gray-500 dark:text-gray-400 hover:text-emerald-500"
      }`}
    >
      <div className={`relative ${isAnimating ? "animate-bounce" : ""}`}>
        <Heart
          size={20}
          className={`transition-all duration-300 ${
            isLiked ? "fill-current scale-110" : "group-hover:scale-110"
          }`}
        />
        {/* Pequeño efecto visual de partículas (opcional) */}
        {isAnimating && (
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        )}
      </div>
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
};

export default LikeButton;