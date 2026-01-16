import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Timer, Target, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const GAME_DURATION = 30;

const CazaTalentos = ({ onBack }) => {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState("idle"); // idle, playing, ended
  const [targets, setTargets] = useState([]);
  const navigate = useNavigate()

  // Iconos que representan las "carreras" o talentos
  const icons = ["🎓", "💻", "⚖️", "🏥", "🏗️", "🎨", "🧬", "🍎"];

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState("playing");
    spawnTarget();
  };

  const spawnTarget = useCallback(() => {
    const id = Math.random();
    const rand = Math.random();
    let type = "talent"; // por defecto es un talento
    if (rand < 0.15) type = "bomb"; // 15% probabilidad bomba
    else if (rand < 0.2) type = "time"; // 5% probabilidad tiempo (entre 0.15 y 0.20)

    const newTarget = {
      id,
      type,
      icon:
        type === "bomb"
          ? "💣"
          : type === "time"
          ? "⏳"
          : icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: type === "talent" ? Math.random() * (60 - 40) + 40 : 65,
    };
    setTargets((prev) => [...prev, newTarget]);

    const duration = type === "time" ? 1000 : 1500;

    // El target desaparece solo después de 1.5 segundos si no lo tocan
    setTimeout(() => {
      setTargets((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, [icons]);

  // Control del tiempo
  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        // Cada segundo hay probabilidad de spawnear más de uno
        spawnTarget();
        if (Math.random() > 0.6) spawnTarget();
      }, 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, spawnTarget]);

  const handleHit = (target) => {
    if (target.type === "bomb") {
      setScore((prev) => Math.max(0, prev - 50));
      toast.error("-50 Puntos 💣", { position: "bottom-center" });
      if (navigator.vibrate) navigator.vibrate(200);
    } else if (target.type === "time") {
      setTimeLeft((prev) => prev + 5);
      toast.success("+5 Segundos! ⏳", {
        icon: "⚡",
        style: { background: "#fbbf24", color: "#000", fontWeight: "bold" },
      });
    } else {
      setScore((prev) => prev + 10);
    }

    setTargets((prev) => prev.filter((t) => t.id !== target.id));
  };

  const endGame = async () => {
    setGameState("ended");
    setTargets([]);

     const { data, error } = await supabaseClient.rpc("submit_game_score", {
        p_game_id: "hunter-talents",
        p_score: score,
        p_moves: 0,
        p_time_seconds: 0,
      });

    if (error) toast.error("No se pudo guardar el puntaje");
    else toast.success("¡Puntaje registrado!");
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] bg-neutral-50 dark:bg-neutral-950 rounded-[3rem] overflow-hidden border-4 border-white dark:border-neutral-900 shadow-2xl flex flex-col">
      {/* Header Info */}
      <div className="p-6 flex justify-between items-center z-10">
        <button
          onClick={()=>navigate(-1)}
          className="p-2 bg-white dark:bg-neutral-800 rounded-full shadow-md"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div className="flex gap-4">
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl font-black flex items-center gap-2 shadow-lg">
            <Timer size={18} /> {timeLeft}s
          </div>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-black flex items-center gap-2 shadow-lg">
            <Target size={18} /> {score}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative cursor-crosshair">
        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-6">
                <Zap size={40} className="text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black uppercase dark:text-white mb-2 italic">
                Caza Talentos
              </h2>
              <p className="text-gray-500 text-sm mb-8 font-medium italic">
                Toca todos los iconos que puedas antes de que se acabe el
                tiempo.
              </p>
              <button
                onClick={startGame}
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                ¡Empezar Ya!
              </button>
            </motion.div>
          )}

          {gameState === "playing" &&
            targets.map((t) => (
              <motion.button
                key={t.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                onClick={() => handleHit(t)}
                className={`absolute flex items-center justify-center shadow-lg rounded-full border-2 transition-all ${
                  t.type === "bomb"
                    ? "bg-red-100 border-red-600 z-30 shadow-red-500/50"
                    : t.type === "time"
                    ? "bg-amber-100 border-amber-500 z-40 shadow-amber-400/50 ring-4 ring-amber-400/20 animate-bounce"
                    : "bg-white dark:bg-neutral-800 border-emerald-500 z-20"
                }`}
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: t.size,
                  height: t.size,
                  fontSize: t.size / 2,
                }}
              >
                <span>{t.icon}</span>
              </motion.button>
            ))}

          {gameState === "ended" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-20"
            >
              <h2 className="text-5xl font-black text-emerald-500 mb-2">
                {score}
              </h2>
              <p className="text-xl font-bold dark:text-white uppercase mb-8">
                Puntos Obtenidos
              </p>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={startGame}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-tighter"
                >
                  Intentar de Nuevo
                </button>
                <button
                  onClick={onBack}
                  className="w-full bg-neutral-200 dark:bg-neutral-800 dark:text-white py-4 rounded-2xl font-black uppercase tracking-tighter"
                >
                  Volver al Menú
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CazaTalentos;
