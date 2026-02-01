import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import { Timer, Target, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DECKS_DATA from "../../assets/data-game/barajas.json";

const GAME_DURATION = 30;

const CazaTalentos = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState("idle"); // idle, playing, ended
  const [targets, setTargets] = useState([]);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [effects, setEffects] = useState([]);
  const navigate = useNavigate();

  // Función para limpiar efectos viejos
  const addEffect = (x, y, type) => {
    const id = Date.now();
    const color = type === "bomb" ? "bg-red-500" : type === "time" ? "bg-amber-500" : "bg-emerald-500";
    setEffects((prev) => [...prev, { id, x, y, color }]);
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 600);
  };

  const startGame = () => {
    // 1. Elegir baraja aleatoria al empezar
    const randomDeck =
      DECKS_DATA[Math.floor(Math.random() * DECKS_DATA.length)];
    setCurrentDeck(randomDeck);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState("playing");
    spawnTarget(randomDeck);
  };

  const spawnTarget = useCallback(
    (deckOverride = null) => {
      const activeDeck = deckOverride || currentDeck;
      if(!activeDeck) return
      const id = Math.random();
      const rand = Math.random();
      let type = "talent"; // por defecto es un talento
      if (rand < 0.15)
        type = "bomb"; // 15% probabilidad bomba
      else if (rand < 0.2) type = "time"; // 5% probabilidad tiempo (entre 0.15 y 0.20)

      // Seleccionar icono o imagen del deck
      const randomItem =
        activeDeck.baraja[Math.floor(Math.random() * activeDeck.baraja.length)];

      const newTarget = {
        id,
        type,
        deckType: activeDeck.type, // "icon" o "img"
        content:
          type === "bomb" ? "💣" : type === "time" ? "⏳" : randomItem.icon,
        x: Math.random() * 80 + 5, // Evitar bordes extremos
        y: Math.random() * 80 + 5,
        size: type === "talent" ? Math.random() * (70 - 50) + 50 : 75,
      };
      setTargets((prev) => [...prev, newTarget]);

      const duration = type === "time" ? 1000 : 1500;

      // El target desaparece solo después de 1.5 segundos si no lo tocan
      setTimeout(() => {
        setTargets((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [currentDeck],
  );

  // Control del tiempo
  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        // Cada segundo hay probabilidad de spawnear más de uno
        spawnTarget();
        if (Math.random() > 0.5) spawnTarget();
      }, 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, spawnTarget]);

  const handleHit = (target) => {
    addEffect(target.x, target.y, target.type);
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
    const { error } = await supabaseClient.rpc("submit_game_score", {
      p_game_id: "hunter-talents",
      p_score: score,
      p_moves: 0,
      p_time_seconds: 0,
    });

    if (error) toast.error("No se pudo guardar el puntaje");
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-dvh max-h-[700px] bg-neutral-50 dark:bg-neutral-950 overflow-hidden flex flex-col sm:rounded-[3rem] sm:mt-5 border-4 border-white dark:border-neutral-900 shadow-2xl">
      {/* HUD (Heads-Up Display) */}
      <div className="p-6 flex justify-between items-center z-50 pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-full shadow-md pointer-events-auto active:scale-90 transition-transform"
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
        {effects.map((eff) => (
          <Particles key={eff.id} x={eff.x} y={eff.y} color={eff.color} />
        ))}
        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-6">
                <Zap size={40} className="text-emerald-600 animate-pulse" />
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
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                onClick={() => handleHit(t)}
                className={`absolute flex items-center justify-center overflow-hidden shadow-xl rounded-2xl border-2 transition-all ${
                  t.type === "bomb"
                    ? "bg-red-100 border-red-600 z-30 " 
                    : t.type === "time"
                      ? "bg-amber-100 border-amber-500 z-40  ring-4 ring-amber-400/20 animate-bounce"
                      : "bg-white dark:bg-neutral-800 border-emerald-500 z-20"
                }`}
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: t.size,
                  height: t.size,
                }}
              >
                {t.type === "talent" && t.deckType === "img" ? (
                  <img
                    src={t.content}
                    alt="target"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span style={{ fontSize: t.size * 0.5 }}>{t.content}</span>
                )}
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
                  onClick={() => navigate(-1)}
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


// --- COMPONENTE DE PARTÍCULAS (Optimizado con memo) ---
const Particles = memo(({ x, y, color }) => {
  const particles = Array.from({ length: 6 });
  return (
    <div className="absolute inset-0 pointer-events-none z-100">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: `${x}%`, y: `${y}%`, scale: 1, opacity: 1 }}
          animate={{ 
            x: `${x + (Math.random() * 20 - 10)}%`, 
            y: `${y + (Math.random() * 20 - 10)}%`, 
            scale: 0, 
            opacity: 0 
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`absolute w-2 h-2 rounded-full ${color}`}
        />
      ))}
    </div>
  );
});

// --- COMPONENTE TARGET (Separado para evitar re-renders del grid) ---
const GameTarget = memo(({ t, onHit }) => (
  <motion.button
    initial={{ scale: 0, rotate: -20 }}
    animate={{ scale: 1, rotate: 0 }}
    exit={{ scale: 0, opacity: 0 }}
    whileTap={{ scale: 0.8 }}
    onClick={() => onHit(t)}
    className={`absolute flex items-center justify-center overflow-hidden shadow-xl rounded-2xl border-2 transition-transform ${
      t.type === "bomb" ? "bg-red-100 border-red-600 z-30" : 
      t.type === "time" ? "bg-amber-100 border-amber-500 z-40 animate-bounce" : 
      "bg-white dark:bg-neutral-800 border-emerald-500 z-20"
    }`}
    style={{
      left: `${t.x}%`,
      top: `${t.y}%`,
      width: t.size,
      height: t.size,
    }}
  >
    {t.type === "talent" && t.deckType === "img" ? (
      <img src={t.content} alt="T" className="w-full h-full object-cover pointer-events-none" />
    ) : (
      <span style={{ fontSize: t.size * 0.5 }} className="pointer-events-none">{t.content}</span>
    )}
  </motion.button>
));

export default CazaTalentos;
