import { Bookmark } from "lucide-react";
import { useBookmark } from "../../../hooks/useBookmark";
import { useAuthAction } from "../../../hooks/useAuthAction";

const BookmarkButton = ({ postId }) => {
  const { isBookmarked, toggleBookmark } = useBookmark(postId);
  const { executeAction } = useAuthAction();

  const handlePress = (e) => {
    e.stopPropagation();
    executeAction(() => {
      toggleBookmark();
    }, "guardar esta publicación");
  };

  return (
    <button 
      onClick={handlePress}
      className={`p-2 rounded-full transition-all hover:bg-emerald-50 dark:hover:bg-emerald-500/10 ${
        isBookmarked ? "text-emerald-500" : "text-gray-400"
      }`}
    >
      <Bookmark 
        size={20} 
        className={isBookmarked ? "fill-current scale-110" : "scale-100"} 
      />
    </button>
  );
};

export default BookmarkButton;