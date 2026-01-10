import { useNavigate } from "react-router-dom";
import { useAuthAction } from "../../hooks/useAuthAction";
import { useQueryClient } from "@tanstack/react-query";
import { useSearch } from "../../context/SearchContext";
import { useAuth } from "../../context/AuthContext";
const RenderTextWithLinks = ({ text }) => {
  if (!text) return null;
  const { executeAction } = useAuthAction();
  const navigate = useNavigate();
  const queryClient = useQueryClient()
  const {queryG} = useSearch()
  const {user} = useAuth()
  
  const handleSearchTrend = (trendName) => {
    if (!trendName) return;
   // queryClient.invalidateQueries({  queryKey: ["search", queryG, user.id], });
    navigate(`/search?q=${encodeURIComponent(trendName.trim())}`);
    
  };

  const handleClick = (trendName) => {
    executeAction(() => {
      handleSearchTrend(trendName);
    }, "buscar trends");
  };
  // Regex combinada para URLs y Hashtags
  // Grupo 1: URLs | Grupo 2: Hashtags
  const combinedRegex = /(https?:\/\/[^\s]+)|(#\w+)/g;

  return text.split(combinedRegex).map((part, i) => {
    if (!part) return null;

    // ¿Es una URL?
    if (/(https?:\/\/[^\s]+)/.test(part)) {
      let displayText = part.replace(/(^\w+:|^)\/\/(www\.)?/, "");

      if (displayText.length > 30) {
        displayText = displayText.substring(0, 30) + "...";
      }
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline break-all"
        >
          {displayText}
        </a>
      );
    }

    // ¿Es un Hashtag?
    if (/#\w+/.test(part)) {
      return (
        <span
          key={i}
          className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline"
          onClick={() => handleSearchTrend(part)}
        >
          {part}
        </span>
      );
    }

    return part;
  });
};

export default RenderTextWithLinks;
