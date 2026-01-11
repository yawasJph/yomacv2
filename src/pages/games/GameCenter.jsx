import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Gamepad2,
  Brain,
  Grid3X3,
  Type,
  ArrowRight,
  Store,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthAction } from "../../hooks/useAuthAction";

const GAMES_LIST = [
  {
    id: "memory",
    title: "Memorama",
    description: "Encuentra las parejas de los perfiles más populares.",
    icon: <Grid3X3 className="text-emerald-500" size={32} />,
    color: "from-emerald-500/20 to-emerald-500/5",
    path: "/games/memory",
    difficulty: "Fácil",
  },
  {
    id: "trivia",
    title: "Trivia Pro",
    description: "Demuestra cuánto sabes de tu carrera y tecnología.",
    icon: <Brain className="text-blue-500" size={32} />,
    color: "from-blue-500/20 to-blue-500/5",
    path: "/games/trivia",
    difficulty: "Medio",
  },
  {
    id: "michi",
    title: "Michi (Tic-Tac-Toe)",
    description: "Reta a la IA o a un amigo en el clásico duelo.",
    icon: <Gamepad2 className="text-purple-500" size={32} />,
    color: "from-purple-500/20 to-purple-500/5",
    path: "/games/michi",
    difficulty: "Medio",
  },
  {
    id: "wordle",
    title: "Palabra Diaria",
    description: "Adivina la palabra del día relacionada al campus.",
    icon: <Type className="text-orange-500" size={32} />,
    color: "from-orange-500/20 to-orange-500/5",
    path: "/games/wordle",
    difficulty: "Difícil",
  },
];

const GameCenter = () => {
  const navigate = useNavigate();
  const { executeAction } = useAuthAction();

  const handleGameNavigate = (path) => {
    executeAction(() => navigate(path), "para jugar");
  };
  return (
    <div className="bg-white dark:bg-black p-4 pb-10">
      {/* min-h-screen */}
      {/* Header */}

      <div className="flex justify-between items-center mb-8 mt-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
            Arcade <Gamepad2 className="text-emerald-500" />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Gana puntos y escala en el ranking de la comunidad.
          </p>
        </div>

        {/* Botón de Ranking Global */}
        <button
          onClick={() => navigate("/games/leaderboard")}
          className="p-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-2 font-bold hover:scale-105 transition-transform border border-emerald-500/20"
        >
          <Trophy size={20} />
          <span className="hidden sm:inline">Ranking Global</span>
        </button>
      </div>

      {/* Grid de Juegos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GAMES_LIST.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleGameNavigate(game.path)}
            className={`relative overflow-hidden cursor-pointer group p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-linear-to-br ${game.color} hover:border-emerald-500/50 transition-all`}
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
                {game.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/50 dark:bg-black/50 rounded-full dark:text-gray-300">
                {game.difficulty}
              </span>
            </div>

            <div className="mt-6 relative z-10">
              <h3 className="text-xl font-bold dark:text-white group-hover:text-emerald-500 transition-colors">
                {game.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                {game.description}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm relative z-10">
              Jugar ahora{" "}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>

            {/* Elemento decorativo de fondo */}
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              {React.cloneElement(game.icon, { size: 120 })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sección de "Próximamente" o Stats rápidas */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
        <p className="text-gray-500 text-sm italic">
          Nuevos desafíos cada semana. ¡Mantente atento!
        </p>
      </div>
    </div>
  );
};

export default GameCenter;
