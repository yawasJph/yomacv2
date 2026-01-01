
import { Repeat2 } from "lucide-react";
import { useAuthAction } from "../../hooks/useAuthAction";
import { useRepost } from "../utils/useRepost";

const RepostButton = ({ postId, initialReposts = 0 }) => {
  const { isReposted, toggleRepost, isLoading } = useRepost(postId);
  const { executeAction } = useAuthAction();

  const handleToggle = (e) => {
    e.stopPropagation();
    executeAction(() => {
      toggleRepost();
    }, "repostear esta publicación");
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 transition-colors group ${
        isReposted 
          ? "text-blue-500" 
          : "hover:text-blue-500 text-gray-500 dark:text-gray-400"
      }`}
    >
      <div className={`p-2 rounded-full transition-colors ${
        isReposted 
          ? "bg-blue-500/10" 
          : "group-hover:bg-blue-500/10"
      }`}>
        <Repeat2 
          size={20} 
          className={`transition-transform duration-300 ${isLoading ? "scale-90 opacity-70" : "group-active:scale-125"}`}
        />
      </div>
      <span className="text-sm font-medium">
        {initialReposts > 0 ? initialReposts : 0}
      </span>
    </button>
  );
};

export default RepostButton;