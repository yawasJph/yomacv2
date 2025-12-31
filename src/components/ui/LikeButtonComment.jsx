import { Heart } from "lucide-react";
import { useCommentLike } from "../../hooks/useCommentLike";

const LikeButtonComment = ({ commentId, postId, initialCount }) => {
  const { isLiked, toggleLike } = useCommentLike(commentId, postId);

  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        toggleLike();
      }}
      className={`flex items-center gap-1.5 transition-colors group/like 
        ${isLiked ? "text-emerald-500" : "text-gray-500 hover:text-emerald-500"}`}
    >
      <div className={`p-1.5 rounded-full ${isLiked ? "bg-emerald-500/10" : "group-hover/like:bg-emerald-500/10"}`}>
        <Heart 
          size={16} 
          className="transition-transform active:scale-125" 
          fill={isLiked ? "currentColor" : "none"} 
        />
      </div>
      <span className="text-xs font-bold">{initialCount || 0}</span>
    </button>
  );
};

export default LikeButtonComment