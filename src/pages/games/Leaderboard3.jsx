import { useEffect, useRef, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import {
  Trophy,
  Medal,
  User,
  Star,
  Brain,
  LayoutGrid,
  Clock,
  Swords,
  MessageSquareText,
  Target,
  Bomb,
  ChevronRight,
  ChevronLeft,
  CombineIcon,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState("memory");
  const [leaders, setLeaders] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate()

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const onWheel = (e) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY * 2,
          behavior: "smooth",
        });
      };
      el.addEventListener("wheel", onWheel);
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let topData = [];
      let myData = null;
      if (activeGame === "wordle") {
        // --- LÓGICA PARA WORDLE (Ranking Acumulado) ---
        const { data: wordleTop } = await supabaseClient
          //.from("wordle_cumulative_ranking")
          .from("wordle_weekly_ranking")
          .select("*")
          .limit(10);

        topData =
          wordleTop?.map((row) => ({
            rank_position: parseInt(row.rank_position),
            user_id: row.user_id,
            score: row.total_score,
            time_seconds: `${row.games_won} Retos`, // Usamos este campo para mostrar victorias
            profiles: {
              full_name: row.full_name,
              avatar: row.avatar,
              carrera: row.carrera,
            },
          })) || [];

        if (user) {
          const { data: myWordle } = await supabaseClient
            .from("wordle_weekly_ranking")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (myWordle) {
            myData = {
              rank_position: parseInt(myWordle.rank_position),
              user_id: myWordle.user_id,
              score: myWordle.total_score,
              time_seconds: `${myWordle.games_won} Retos`,
              profiles: {
                full_name: myWordle.full_name,
                avatar: myWordle.avatar,
                carrera: myWordle.carrera,
              },
            };
          }
        }
      } else if (activeGame === "michi_online") {
        // --- LÓGICA PARA MICHI (Vista Especial) ---
        const { data: michiTop } = await supabaseClient
          .from("michi_weekly_ranking")
          .select("*")
          .limit(10);

        // Normalizamos los datos de la vista para el componente
        topData =
          michiTop?.map((row) => ({
            rank_position: parseInt(row.rank_position),
            user_id: row.user_id,
            score: row.total_wins,
            time_seconds: "Victorias", // Etiqueta especial
            profiles: {
              full_name: row.full_name,
              avatar: row.avatar,
              carrera: row.carrera,
            },
          })) || [];

        if (user) {
          const { data: myMichi } = await supabaseClient
            .from("michi_weekly_ranking")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (myMichi) {
            myData = {
              rank_position: parseInt(myMichi.rank_position),
              user_id: myMichi.user_id,
              score: myMichi.total_wins,
              time_seconds: "Victorias",
              profiles: {
                full_name: myMichi.full_name,
                avatar: myMichi.avatar,
                carrera: myMichi.carrera,
              },
            };
          }
        }
      } else {
        // --- LÓGICA PARA MEMORAMA Y TRIVIA (Vista Estándar) ---
        const { data: genericTop } = await supabaseClient
          .from("generic_weekly_ranking")
          .select(
            `rank_position, user_id, score:max_score, time_seconds:best_time, profiles!inner (full_name, avatar, carrera)`
          )
          .eq("game_id", activeGame)
          .order("rank_position", { ascending: true })
          .limit(10);

        topData = genericTop || [];

        if (user) {
          const { data: myGeneric } = await supabaseClient
            .from("generic_weekly_ranking")
            .select(
              `rank_position, user_id, score:max_score, time_seconds:best_time, profiles!inner (full_name, avatar, carrera)`
            )
            .eq("game_id", activeGame)
            .eq("user_id", user.id)
            .maybeSingle();
          myData = myGeneric;
        }
      }

      setLeaders(topData);
      const isAlreadyInTop = topData.some((l) => l.user_id === user?.id);
      setUserStats(!isAlreadyInTop ? myData : null);
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
    <div className="max-w-md max-sm:max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="bg-linear-to-r from-emerald-500 to-teal-600 p-6 text-white text-center flex gap-2">
         <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-600 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="dark:text-white" />
          </button>
        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center justify-center gap-2">
          <Trophy className="text-yellow-300" /> Ranking Campus
        </h2>
      </div>

      {/* Contenedor de Tabs con Scroll Horizontal Invisible */}
      <div className="relative mx-4 mt-4 group">
        {/* Flecha Izquierda (Solo visible en Desktop al hacer hover) */}
        <button
          onClick={() =>
            scrollRef.current.scrollBy({ left: -200, behavior: "smooth" })
          }
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 hidden md:block transition-opacity"
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        {/* Gradientes laterales para dar efecto de profundidad y continuidad */}
        {/* <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" /> */}

        <div
          className="flex overflow-x-auto gap-2 py-2 no-scrollbar scroll-smooth snap-x"
          ref={scrollRef}
        >
          {/* Contenedor interno con padding extra para que el scroll no choque con los bordes */}
          <div className="flex gap-2 ">
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
              label="Trivia"
            />
            <TabButton
              active={activeGame === "wordle"}
              onClick={() => setActiveGame("wordle")}
              icon={<MessageSquareText size={16} />}
              label="Wordle"
            />
            <TabButton
              active={activeGame === "michi_online"}
              onClick={() => setActiveGame("michi_online")}
              icon={<Swords size={16} />}
              label="Michi"
            />
            <TabButton
              active={activeGame === "hunter-talents"}
              onClick={() => setActiveGame("hunter-talents")}
              icon={<Target size={16} />}
              label="Talentos"
            />
            <TabButton
              active={activeGame === "buscaminas"}
              onClick={() => setActiveGame("buscaminas")}
              icon={<Bomb size={16} />}
              label="BuscaMinas"
            />
             <TabButton
              active={activeGame === "mastermind"}
              onClick={() => setActiveGame("mastermind")}
              icon={<CombineIcon size={16} />}
              label="Codigo Matricula"
            />
          </div>
        </div>

        {/* Flecha Derecha (Solo visible en Desktop al hacer hover) */}
        <button
          onClick={() =>
            scrollRef.current.scrollBy({ left: 200, behavior: "smooth" })
          }
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 hidden md:block transition-opacity"
        >
          <ChevronRight
            size={20}
            className="text-gray-600 dark:text-gray-300"
          />
        </button>
      </div>

      <div className="p-4 pt-0 min-h-[450px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 mt-3"
            >
              {leaders.length > 0 ? (
                <>
                  {leaders.map((entry) => (
                    <LeaderItem
                      key={entry.user_id}
                      entry={entry}
                      isMichi={activeGame === "michi_online"}
                    />
                  ))}

                  {userStats && (
                    <>
                      <div className="flex items-center gap-2 py-2">
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Tu Posición
                        </span>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                      </div>
                      <LeaderItem
                        entry={userStats}
                        isMe={true}
                        isMichi={activeGame === "michi_online"}
                      />
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

// Subcomponente Item Actualizado
const LeaderItem = ({ entry, isMe, isMichi }) => {
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

      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-gray-100">
        {entry.profiles?.avatar ? (
          <img
            src={entry.profiles.avatar}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
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
          {!isMichi && <Clock size={8} />} {entry.time_seconds}
          {!isMichi && "s"}
        </p>
      </div>
    </motion.div>
  );
};

// Componentes auxiliares...
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex-none snap-center flex items-center gap-2 px-5 py-2.5 rounded-2xl 
      font-black text-[11px] uppercase tracking-tighter transition-all duration-300
      ${
        active
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
          : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
      }
    `}
  >
    {icon}
    <span className="whitespace-nowrap">{label}</span>
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
    Aún no hay récords.
  </div>
);

export default Leaderboard;
