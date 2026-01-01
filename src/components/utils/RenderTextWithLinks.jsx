import { useNavigate } from "react-router-dom";
import { useAuthAction } from "../../hooks/useAuthAction";
const RenderTextWithLinks = ({ text }) => {
  if (!text) return null;
  const { executeAction } = useAuthAction();
  const navigate = useNavigate();
  
  const handleSearchTrend = (trendName) => {
    if (!trendName) return;
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
          onClick={() => handleClick(part)}
        >
          {part}
        </span>
      );
    }

    return part;
  });
};

export default RenderTextWithLinks;
