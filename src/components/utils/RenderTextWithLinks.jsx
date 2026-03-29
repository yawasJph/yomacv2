import { useNavigate } from "react-router-dom";

const RenderTextWithLinks = ({ text }) => {
  if (!text) return null;

  const navigate = useNavigate();

  const handleSearchTrend = (trendName) => {
    if (!trendName) return;
    navigate(`/search?q=${encodeURIComponent(trendName.trim())}`);
  };

  const handleMentionClick = (username) => {
    if (!username) return;
    navigate(`/profile/@${username}`);
  };

  // 🔥 Ahora incluye menciones
  // Grupo 1: URLs | Grupo 2: Hashtags | Grupo 3: Mentions
  const combinedRegex = /(https?:\/\/[^\s]+)|(#\w+)|(@\w+)/g;

  return text.split(combinedRegex).map((part, i) => {
    if (!part) return null;

    // ✅ URL
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

    // ✅ Hashtag
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

    // ✅ Mention (@usuario)
    if (/@\w+/.test(part)) {
      const username = part.replace("@", "");

      return (
        <span
          key={i}
          className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline"
          onClick={() => handleMentionClick(username)}
        >
          {part}
        </span>
      );
    }

    return part;
  });
};

export default RenderTextWithLinks;