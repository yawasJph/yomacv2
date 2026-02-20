import React, { useCallback, memo } from "react"; // Importar hooks de optimización
import { useQuery } from "@tanstack/react-query"; // Importar React Query
import { useEffect, useRef, useState } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import {
  Trophy,
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

// 1. Extraemos la lógica de fetch para React Query
const fetchGameLeaders = async (activeGame, user) => {
  let topData = [];
  let myData = null;

  if (activeGame === "wordle") {
    const { data: wordleTop } = await supabaseClient
      .from("wordle_weekly_ranking")
      .select("*")
      .limit(10);

    topData =
      wordleTop?.map((row) => ({
        rank_position: parseInt(row.rank_position),
        user_id: row.user_id,
        score: row.total_score,
        time_seconds: `${row.games_won} Retos`,
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
      if (myWordle)
        myData = {
          ...myWordle,
          score: myWordle.total_score,
          rank_position: parseInt(myWordle.rank_position),
          time_seconds: `${myWordle.games_won} Retos`,
          profiles: {
            full_name: myWordle.full_name,
            avatar: myWordle.avatar,
            carrera: myWordle.carrera,
          },
        };
    }
  } else if (activeGame === "michi_online") {
    const { data: michiTop } = await supabaseClient
      .from("michi_weekly_ranking")
      .select("*")
      .limit(10);
    topData =
      michiTop?.map((row) => ({
        rank_position: parseInt(row.rank_position),
        user_id: row.user_id,
        score: row.total_wins,
        time_seconds: "Victorias",
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
      if (myMichi)
        myData = {
          ...myMichi,
          rank_position: parseInt(myMichi.rank_position),
          score: myMichi.total_wins,
          time_seconds: "Victorias",
          profiles: {
            full_name: myMichi.full_name,
            avatar: myMichi.avatar,
            carrera: myMichi.carrera,
          },
        };
    }
  } else {
    const { data: genericTop } = await supabaseClient
      .from("generic_weekly_ranking")
      .select(
        `rank_position, user_id, score:max_score, time_seconds:best_time, profiles!inner (full_name, avatar, carrera)`,
      )
      .eq("game_id", activeGame)
      .order("rank_position", { ascending: true })
      .limit(10);
    topData = genericTop || [];

    if (user) {
      const { data: myGeneric } = await supabaseClient
        .from("generic_weekly_ranking")
        .select(
          `rank_position, user_id, score:max_score, time_seconds:best_time, profiles!inner (full_name, avatar, carrera)`,
        )
        .eq("game_id", activeGame)
        .eq("user_id", user.id)
        .maybeSingle();
      myData = myGeneric;
    }
  }

  const isAlreadyInTop = topData.some((l) => l.user_id === user?.id);
  return { leaders: topData, userStats: !isAlreadyInTop ? myData : null };
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState("memory");
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // 2. Implementación de React Query
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", activeGame, user?.id],
    queryFn: () => fetchGameLeaders(activeGame, user),
    staleTime: 1000 * 60 * 5, // La data se considera fresca por 5 minutos
  });

  // 3. Memoizar el cambio de tab para evitar renders innecesarios en TabButton
  const handleTabClick = useCallback((game) => {
    setActiveGame(game);
  }, []);

  // ... (Efecto de scroll wheel se mantiene igual)
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

  return (
    <div className="max-w-xl max-sm:max-w-sm mx-auto bg-gray-50/50 dark:bg-white/2 pb-2 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden mt-2 ms:mt-5">
        
      <div className="relative p-8 pb-4">
        {/* Botón Volver - Minimalista y funcional */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-9 p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:shadow-inner border border-gray-100 dark:border-gray-700"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Contenido Central */}
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-linear-to-r from-transparent to-yellow-400/50" />
            <Trophy
              size={20}
              className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
            />
            <div className="h-px w-8 bg-linear-to-l from-transparent to-yellow-400/50" />
          </div>

          <h2 className="text-xl font-black tracking-[0.2em] uppercase text-gray-800 dark:text-white leading-none mt-2">
            Ranking <span className="text-emerald-500">Campus</span>
          </h2>

          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] ml-1">
            Semana Actual
          </p>
        </div>
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
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />

        <div
          className="flex overflow-x-auto gap-2 py-2 no-scrollbar scroll-smooth snap-x bg-white dark:bg-black/20 rounded-4xl border border-gray-200/50 dark:border-white/5 mt-5"
            
          ref={scrollRef}
        >{/* gap-4 mx-4 mb-6 */}
          {/* Contenedor interno con padding extra para que el scroll no choque con los bordes */}
          <div className="flex gap-2 mx-2 ">
            <TabButton
              active={activeGame === "memory"}
              onClick={() => handleTabClick("memory")}
              icon={<LayoutGrid size={16} />}
              label="Memorama"
            />
            <TabButton
              active={activeGame === "trivia"}
              onClick={() => handleTabClick("trivia")}
              icon={<Brain size={16} />}
              label="Trivia"
            />
            <TabButton
              active={activeGame === "wordle"}
              onClick={() => handleTabClick("wordle")}
              icon={<MessageSquareText size={16} />}
              label="Wordle"
            />
            <TabButton
              active={activeGame === "michi_online"}
              onClick={() => handleTabClick("michi_online")}
              icon={<Swords size={16} />}
              label="Michi"
            />
            <TabButton
              active={activeGame === "hunter-talents"}
              onClick={() => handleTabClick("hunter-talents")}
              icon={<Target size={16} />}
              label="Talentos"
            />
            <TabButton
              active={activeGame === "buscaminas"}
              onClick={() => handleTabClick("buscaminas")}
              icon={<Bomb size={16} />}
              label="BuscaMinas"
            />
            <TabButton
              active={activeGame === "mastermind"}
              onClick={() => handleTabClick("mastermind")}
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

      <div className="p-4 min-h-[450px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 mt-3"
            >
              {data?.leaders.map((entry) => (
                <LeaderItem
                  key={entry.user_id}
                  entry={entry}
                  isMichi={activeGame === "michi_online"}
                />
              ))}

              {data?.userStats && (
                <>
                  <DividerLabel label="Tu Posición" />
                  <LeaderItem
                    entry={data.userStats}
                    isMe
                    isMichi={activeGame === "michi_online"}
                  />
                </>
              )}

              {data?.leaders.length === 0 && <EmptyState />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
};

const LeaderItem = memo(({ entry, isMe, isMichi }) => {
  const rank = entry.rank_position;

  // 1. Definimos la intensidad del efecto según el podio
  const podiumStyles = {
    1: {
      glow: "shadow-[0_0_25px_-5px_rgba(250,204,21,0.4)] border-yellow-400/30",
      badge: "bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-500/50",
      iconColor: "text-yellow-500",
    },
    2: {
      glow: "shadow-[0_0_20px_-8px_rgba(148,163,184,0.3)] border-slate-300/30",
      badge: "bg-slate-300 text-slate-700",
      iconColor: "text-slate-400",
    },
    3: {
      glow: "shadow-[0_0_15px_-10px_rgba(253,186,116,0.3)] border-orange-300/30",
      badge: "bg-orange-300 text-orange-800",
      iconColor: "text-orange-500",
    },
  };

  // Estilos por defecto para el resto
  const currentStyle = podiumStyles[rank] || {
    glow: "border-transparent",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-400",
    iconColor: "text-emerald-500",
  };

  return (
    <motion.div
      layout
      whileHover={{ x: 5 }}
      className={`relative group flex items-center gap-4 p-4 rounded-4xl transition-all duration-700 border
        ${currentStyle.glow}
        ${
          isMe
            ? "bg-white/15 backdrop-blur-xl border-white/30 shadow-2xl"
            : "bg-transparent hover:bg-white/5"
        }`}
    >
      {/* Indicador de posición con "Halo" para el #1 */}
      <div className="relative flex-none">
        {rank === 1 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-400 blur-xl rounded-full"
          />
        )}
        <div
          className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-2xl font-black text-lg transition-transform
          ${currentStyle.badge}`}
        >
          {rank}
        </div>
      </div>

      {/* Avatar con borde de color sutil si es podio */}
      <div className="relative">
        <img
          src={entry.profiles?.avatar}
          className={`w-12 h-12 rounded-[1.2rem] object-cover transition-all duration-500
            ${rank <= 3 ? "p-0.5 border-2" : "border-0"}
            ${rank === 1 ? "border-yellow-400" : rank === 2 ? "border-slate-300" : rank === 3 ? "border-orange-300" : ""}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate tracking-tight">
          {entry.profiles?.full_name}
        </h3>
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.15em] mt-0.5">
          {entry.profiles?.carrera}
        </p>
      </div>

      <div className="text-right">
        <div className="flex items-center justify-end gap-1.5 font-black text-lg">
          {/* El icono cambia de color solo en el top 3 */}
          <Star
            size={14}
            className={`fill-current ${currentStyle.iconColor}`}
          />
          <span className="bg-linear-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            {entry.score.toLocaleString()}
          </span>
        </div>

        <div className="text-[10px] font-bold text-gray-400 flex items-center justify-end gap-1">
          {!isMichi && <Clock size={10} className={currentStyle.iconColor} />}
          {entry.time_seconds}
          {!isMichi && "s"}
        </div>
      </div>
    </motion.div>
  );
});

const TabButton = memo(({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex-none snap-center flex items-center gap-2 px-6 py-3 rounded-2xl 
      font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500
      ${
        active
          ? "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_20px_-5px_rgba(0,0,0,0.1)] border border-gray-200/50 dark:border-white/10 scale-105"
          : "bg-transparent text-gray-400 opacity-60 hover:opacity-100"
      }
    `}
  >
    {/* Icono con un toque de color solo si está activo */}
    <span className={`transition-all duration-500 ${active ? "text-emerald-500 scale-110" : "text-gray-400"}`}>
      {React.cloneElement(icon, { size: 14, strokeWidth: 3 })}
    </span>
    
    <span className="whitespace-nowrap italic">{label}</span>

    {/* El único elemento de color sólido es una barra minúscula vertical */}
    {active && (
      <motion.div 
        layoutId="tabAccent"
        className="absolute left-2 w-1 h-3 rounded-full bg-emerald-500"
      />
    )}
  </button>
));

const DividerLabel = memo(({ label }) => (
  <div className="flex items-center gap-2 py-2">
    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </span>
    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
  </div>
));

const LoadingState = memo(() => (
  <motion.div
    key="loading"
    className="flex flex-col items-center justify-center py-20"
  >
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
      Calculando puestos...
    </p>
  </motion.div>
));

const EmptyState = memo(() => (
  <div className="text-center py-20 text-gray-400 text-sm font-medium">
    Aún no hay récords.
  </div>
));

export default Leaderboard;
