import { Trophy } from "lucide-react";

const LeaderboardButton = ({ onClick }) => (
    <button
      onClick={onClick}
      className="
        p-3 rounded-2xl flex items-center gap-2 font-bold
        bg-emerald-100 dark:bg-emerald-500/10
        text-emerald-600 dark:text-emerald-400
        border border-emerald-500/20
        hover:scale-105 transition-transform
      "
    >
      <Trophy size={20} />
      <span className="hidden sm:inline">Ranking Global</span>
    </button>
  );

  export default LeaderboardButton