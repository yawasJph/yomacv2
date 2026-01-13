import { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import {
  Trophy,
  Medal,
  User,
  Star,
  Brain,
  LayoutGrid,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState("memory");
  const [leaders, setLeaders] = useState([]);
  const [userStats, setUserStats] = useState(null); // Estado para mi posición
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // 0. Obtener usuario actual
    //   const {
    //     data: { user },
    //   } = await supabaseClient.auth.getUser();

      // 1. Traer el Top 10 Global usando la columna 'rank_position' de la vista
      const { data: topData, error: topError } = await supabaseClient
        .from("best_scores_per_user")
        .select(
          `
          rank_position,
          user_id,
          score:max_score,
          time_seconds:best_time,
          profiles!inner (full_name, avatar, carrera, ciclo)
        `
        )
        .eq("game_id", activeGame)
        .order("rank_position", { ascending: true })
        .limit(2);

      if (topError) throw topError;
      setLeaders(topData);

      // 2. Traer mi posición específica (si estoy logueado)
      if (user) {
        const { data: myData } = await supabaseClient
          .from("best_scores_per_user")
          .select(
            `
            rank_position,
            user_id,
            score:max_score,
            time_seconds:best_time,
            profiles!inner (full_name, avatar, carrera, ciclo)
          `
          )
          .eq("game_id", activeGame)
          .eq("user_id", user.id)
          .single();

        // Solo guardamos mis stats si NO estoy ya en el top 10
        const isAlreadyInTop = topData.some((l) => l.user_id === user.id);
        setUserStats(!isAlreadyInTop ? myData : null);
      }
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeGame]);

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden mt-2">
      {/* Encabezado */}
      <div className="bg-linear-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center justify-center gap-2">
          <Trophy className="text-yellow-300" /> Ranking Campus
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-gray-100 dark:bg-gray-800 m-4 rounded-2xl gap-1">
        <TabButton
          active={activeGame === "memory"}
          onClick={() => setActiveGame("memory")}
          icon={<LayoutGrid size={16} />}
          label="Memorama"
        />
        <TabButton
          active={activeGame === "trivia"}
          onClick={() => setActiveGame("trivia")}
          icon={<Brain size={16} />}
          label="Trivia Pro"
        />
      </div>

      <div className="p-4 pt-0 min-h-[450px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {leaders.length > 0 ? (
                <>
                  {/* El Top 10 */}
                  {leaders.map((entry) => (
                    <LeaderItem key={entry.user_id} entry={entry} />
                  ))}

                  {/* Mi Posición (Si estoy fuera del Top 10) */}
                  {userStats && (
                    <>
                      <div className="flex items-center gap-2 py-2">
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Tu Posición
                        </span>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                      </div>
                      <LeaderItem entry={userStats} isMe={true} />
                    </>
                  )}
                </>
              ) : (
                <EmptyState />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Subcomponente Item
const LeaderItem = ({ entry, isMe }) => {
  const rank = entry.rank_position;
  const isTop3 = rank <= 3;
  const medalColors = [
    "",
    "text-yellow-500",
    "text-gray-400",
    "text-orange-400",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
        isMe
          ? "bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 ring-1 ring-blue-500/20"
          : isTop3
          ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 shadow-sm"
          : "bg-gray-50/30 dark:bg-gray-800/20 border-transparent"
      }`}
    >
      <div className="w-8 flex justify-center font-black text-sm text-gray-400">
        {isTop3 ? (
          <Medal className={medalColors[rank]} size={24} />
        ) : (
          `#${rank}`
        )}
      </div>

      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
        {entry.profiles?.avatar ? (
          <img
            src={entry.profiles.avatar}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
            <User size={18} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={`font-bold text-sm truncate ${
            isMe
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-800 dark:text-gray-100"
          }`}
        >
          {entry.profiles?.full_name} {isMe && "(Tú)"}
        </h3>
        <p className="text-[9px] text-gray-500 font-bold uppercase truncate">
          {entry.profiles?.carrera}
        </p>
      </div>

      <div className="text-right">
        <div className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400 font-black">
          <Star size={12} className="fill-emerald-500" />
          {entry.score}
        </div>
        <p className="text-[9px] text-gray-400 font-bold flex items-center justify-end gap-1 uppercase">
          <Clock size={8} /> {entry.time_seconds}s
        </p>
      </div>
    </motion.div>
  );
};

// Componentes pequeños de apoyo para limpieza
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
      active
        ? "bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400"
        : "text-gray-500"
    }`}
  >
    {icon} {label}
  </button>
);

const LoadingState = () => (
  <motion.div
    key="loading"
    className="flex flex-col items-center justify-center py-20"
  >
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
      Calculando puestos...
    </p>
  </motion.div>
);

const EmptyState = () => (
  <div className="text-center py-20 text-gray-400 text-sm font-medium">
    Aún no hay récords en este juego.
  </div>
);

export default Leaderboard;
