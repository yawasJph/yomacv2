import { Heart } from "lucide-react";
import { useLike } from "../../../hooks/useLike";
import { useAuthAction } from "../../../hooks/useAuthAction";

const LikeButton = ({ postId, initialCount = 0, query = "" }) => {
  const { isLiked, toggleLike, isLoading } = useLike(postId, query);
  const { executeAction } = useAuthAction();
  

  return (
    <>
      <button
        disabled={isLoading}
        onClick={(e) => {
          e.stopPropagation();
          executeAction(toggleLike, "para dar like");
          // toggleLike();
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
        <span className="text-sm font-medium">{initialCount}</span>
      </button>
    </>
  );
};

export default LikeButton;
