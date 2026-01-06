import { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { Trophy, Medal, User, Star } from "lucide-react";
import { motion } from "framer-motion";

const Leaderboard = ({ gameId = "memory" }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Consultamos la VISTA en lugar de la tabla
      const { data, error } = await supabaseClient
        .from("best_scores_per_user")
        .select(
          `
        score:max_score,
        time_seconds:best_time,
        profiles!inner (
          full_name,
          avatar,
          carrera,
          ciclo
        )
      `
        )
        .eq("game_id", gameId)
        .order("max_score", { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaders(data);
    } catch (error) {
      console.error("Error al cargar ranking:", error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log(leaders);
  useEffect(() => {
    fetchLeaderboard();
  }, [gameId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        Cargando campeones...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-4xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Encabezado */}
      <div className="bg-linear-to-r from-emerald-500 to-teal-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-300" size={28} />
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-wider">
              Top 10 Campus
            </h2>
            <p className="text-xs text-emerald-100">Los mejores de la semana</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {leaders.map((entry, index) => {
          const isTop3 = index < 3;
          const medalColors = [
            "text-yellow-500",
            "text-gray-400",
            "text-orange-400",
          ];

          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                isTop3
                  ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"
                  : "bg-gray-50/50 dark:bg-gray-800/30 border-transparent"
              }`}
            >
              {/* Posición */}
              <div className="w-8 flex justify-center font-black text-lg text-gray-400">
                {isTop3 ? (
                  <Medal className={medalColors[index]} size={24} />
                ) : (
                  index + 1
                )}
              </div>

              {/* Avatar */}
              <div className="relative">
                {entry.profiles?.avatar ? (
                  <img
                    src={entry.profiles.avatar}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={20} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Info Usuario */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">
                  {entry.profiles?.full_name || "Usuario Anónimo"} gonzales xapata trujillo
                </h3>
                <p className="text-[10px] text-gray-500 font-medium truncate uppercase tracking-tight">
                  {entry.profiles?.carrera} • Ciclo {entry.profiles?.ciclo}
                </p>
              </div>

              {/* Puntaje */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400 font-black text-lg">
                  <Star size={14} className="fill-emerald-500" />
                  {entry.score}
                </div>
                <p className="text-[10px] text-gray-400 ">
                  <span className="font-bold uppercase">
                    {entry.time_seconds}
                  </span>{" "}
                  seg
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
