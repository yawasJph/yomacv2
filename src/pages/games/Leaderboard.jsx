import { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { Trophy, Medal, User, Star, Brain, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Leaderboard = () => {
  // Estado para saber qué ranking mostrar
  const [activeGame, setActiveGame] = useState("memory"); // "memory" o "trivia"
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("best_scores_per_user")
        .select(`
          score:max_score,
          time_seconds:best_time,
          accuracy:best_accuracy,
          moves:best_moves,
          profiles!inner (
            full_name,
            avatar,
            carrera,
            ciclo
          )
        `)
        .eq("game_id", activeGame) // Usamos el estado dinámico
        .order("max_score", { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaders(data);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeGame]); // Se dispara cada vez que cambias de pestaña

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden mt-2">
      
      {/* Encabezado Principal */}
      <div className="bg-linear-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center justify-center gap-2">
          <Trophy className="text-yellow-300" /> Ranking Campus
        </h2>
      </div>

      {/* Selector de Juego (Tabs) */}
      <div className="flex p-2 bg-gray-100 dark:bg-gray-800 m-4 rounded-2xl gap-1">
        <button
          onClick={() => setActiveGame("memory")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeGame === "memory"
              ? "bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400"
              : "text-gray-500"
          }`}
        >
          <LayoutGrid size={16} /> Memorama
        </button>
        <button
          onClick={() => setActiveGame("trivia")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeGame === "trivia"
              ? "bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400"
              : "text-gray-500"
          }`}
        >
          <Brain size={16} /> Trivia Pro
        </button>
      </div>

      {/* Lista de Líderes */}
      <div className="p-4 pt-0 min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Actualizando Tabla...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {leaders.length > 0 ? (
                leaders.map((entry, index) => (
                   <LeaderItem key={index} entry={entry} index={index} />
                ))
              ) : (
                <div className="text-center py-20 text-gray-400 text-sm font-medium">
                  Aún no hay récords en este juego.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Subcomponente para cada fila (Para limpiar el código principal)
const LeaderItem = ({ entry, index }) => {
  const isTop3 = index < 3;
  const medalColors = ["text-yellow-500", "text-gray-400", "text-orange-400"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
        isTop3
          ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 shadow-sm"
          : "bg-gray-50/30 dark:bg-gray-800/20 border-transparent"
      }`}
    >
      <div className="w-8 flex justify-center font-black text-lg text-gray-400">
        {isTop3 ? <Medal className={medalColors[index]} size={24} /> : index + 1}
      </div>

      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
        {entry.profiles?.avatar ? (
          <img src={entry.profiles.avatar} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
            <User size={18} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">
          {entry.profiles?.full_name}
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
        <p className="text-[9px] text-gray-400 font-bold uppercase">{entry.time_seconds}s</p>
      </div>
    </motion.div>
  );
};

export default Leaderboard;