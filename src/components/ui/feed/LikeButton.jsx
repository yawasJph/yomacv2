import { Heart } from "lucide-react";
import { useLike } from "../../../hooks/useLike";


const LikeButton = ({ postId, initialCount = 0 }) => {
  const { isLiked, toggleLike, isLoading } = useLike(postId);

  // Ajustamos el contador visualmente de forma local para el feedback inmediato
  // (Aunque lo ideal es que el contador venga del query de posts)

  const displayCount = isLiked ? initialCount + 1 : initialCount;

  return (
    <>
     <button
     disabled={isLoading}
       onClick={(e) => {
        e.stopPropagation();
        toggleLike();
      }}
      className={`flex items-center gap-2 transition-colors group ${
        isLiked 
          ? "text-emerald-400 dark:text-emerald-500" 
          : "text-gray-500 dark:text-gray-400 hover:text-emerald-500"
      }`}
    >
      <div className={`relative ${isLiked ? "animate-heart-pop" : ""}`}>
        <Heart
          size={20}
          className={`transition-all duration-300 ${
            isLiked ? "fill-current scale-110" : "group-hover:scale-110"
          }`}
        />
      </div>
      <span className="text-sm font-medium">{displayCount > 0 && displayCount || 0}</span>
    </button>
    </>
  );
};

export default LikeButton