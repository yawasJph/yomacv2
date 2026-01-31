import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import { Timer, Target, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DECKS_DATA from "../../assets/data-game/barajas.json";

// --- COMPONENTE TARGET (Separado para evitar re-renders del grid) ---

const Particles = memo(({ x, y, color }) => {
  const particles = Array.from({ length: 10 }); // Más partículas para mejor feedback
  return (
    <div className="absolute inset-0 pointer-events-none z-100">
      {particles.map((_, i) => {
        const angle = i * 36 * (Math.PI / 180); // Distribución circular
        const velocity = 20 + Math.random() * 20;
        const targetX = Math.cos(angle) * velocity;
        const targetY = Math.sin(angle) * velocity;

        return (
          <motion.div
            key={i}
            initial={{ left: `${x}%`, top: `${y}%`, scale: 0 }}
            animate={{
              left: `${x + targetX}%`,
              top: `${y + targetY}%`,
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`absolute w-2 h-2 rounded-full ${color} shadow-[0_0_8px_currentColor]`}
          />
        );
      })}
    </div>
  );
});

const GameTarget = memo(({ t, onHit }) => (
  <motion.button
    initial={{ scale: 0, rotate: -20 }}
    animate={{ scale: 1, rotate: 0 }}
    exit={{ scale: 0, opacity: 0 }}
    whileTap={{ scale: 0.8 }}
    onClick={() => onHit(t)}
    className={`absolute flex items-center justify-center overflow-hidden shadow-xl rounded-2xl border-2 transition-transform ${
      t.clicked && t.type === "talent" ? "opacity-50 scale-90 grayscale" : ""
    } ${
      t.type === "bomb"
        ? "bg-red-100 border-red-600 z-30"
        : t.type === "time"
          ? "bg-amber-100 border-amber-500 z-40 animate-bounce"
          : "bg-white dark:bg-neutral-800 border-emerald-500 z-20"
    }`}
    style={{
      left: `${t.x}%`,
      top: `${t.y}%`,
      width: t.size,
      height: t.size,
    }}
  >
    {t.clicked && t.type === "time" && (
      <span className="text-xs font-black text-amber-600">+5s</span>
    )}

    {/* Animación de puntos flotantes */}
    <AnimatePresence>
      {t.clicked && t.type === "time" && (
        <div className="absolute right-1/2 top-1/2 z-50 flex flex-col items-end">
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -50 }}
            exit={{ opacity: 0 }}
            className="text-amber-500 font-bold text-3xl"
          >
            +5s
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {t.type === "talent" && t.deckType === "img" ? (
      <img
        src={t.content}
        alt="T"
        className="w-full h-full object-cover pointer-events-none"
      />
    ) : (
      <span style={{ fontSize: t.size * 0.5 }} className="pointer-events-none">
        {t.content}
      </span>
    )}
  </motion.button>
));

// Añade esto en tus estilos globales o dentro de un tag <style> en el componente
const backgroundAnimation = {
  animate: {
    backgroundPosition: ["0px 0px", "24px 24px"],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "linear",
  },
};

const GAME_DURATION = 30;

const CazaTalentos = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState("idle");
  const [targets, setTargets] = useState([]);
  const [effects, setEffects] = useState([]); // Para las partículas
  const [currentDeck, setCurrentDeck] = useState(null);
  const navigate = useNavigate();

  // Función para limpiar efectos viejos
  const addEffect = (x, y, type) => {
    const id = Date.now();
    const color =
      type === "bomb"
        ? "bg-red-500"
        : type === "time"
          ? "bg-amber-500"
          : "bg-emerald-500";
    setEffects((prev) => [...prev, { id, x, y, color }]);
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 600);
  };

  // Loop principal optimizado

  const spawnTarget = useCallback(
    (deckOverride = null) => {
      const activeDeck = deckOverride || currentDeck;
      if (!activeDeck) return;

      const id = Math.random();
      const rand = Math.random();

      // --- LÓGICA DE DIFICULTAD DINÁMICA ---
      // A más puntos, menos probabilidad de reloj y más de bomba
      let timeChance = 0.2; // 20% inicial
      let bombChance = 0.15; // 15% inicial
      let lifespan = 1800; // 1.8 segundos iniciales

      if (score > 500) {
        timeChance = 0.12;
        bombChance = 0.2;
        lifespan = 1400;
      }
      if (score > 1200) {
        timeChance = 0.07; // Solo 7% de probabilidad de reloj
        bombChance = 0.3; // 30% de bombas (peligro constante)
        lifespan = 1000; // Debes ser ultra rápido
      }

      // Selección del tipo basado en las nuevas probabilidades
      let type = "talent";
      if (rand < bombChance) type = "bomb";
      else if (rand < bombChance + timeChance) type = "time";

      const randomItem =
        activeDeck.baraja[Math.floor(Math.random() * activeDeck.baraja.length)];

      const newTarget = {
        id,
        type,
        deckType: activeDeck.type,
        content:
          type === "bomb" ? "💣" : type === "time" ? "⏳" : randomItem.icon,
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        size: type === "talent" ? Math.random() * 20 + 50 : 75,
        clicked: false, // El flag que evita el bug
      };

      setTargets((prev) => [...prev, newTarget]);

      // El target dura menos conforme el jugador es mejor
      setTimeout(() => {
        setTargets((prev) => prev.filter((t) => t.id !== id));
      }, lifespan);
    },
    [currentDeck, score],
  ); // Ahora depende del score

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });

      // Siempre spawnea uno
      spawnTarget();

      // Probabilidad de spawnear un segundo target extra
      // Aumenta la densidad de objetos si el score es alto
      const extraSpawnChance = score > 1000 ? 0.7 : 0.4;
      if (Math.random() < extraSpawnChance) {
        setTimeout(() => spawnTarget(), 300);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, spawnTarget, score]);

  const handleHit = useCallback((target) => {
    // Buscamos si el target ya fue cliqueado en el estado actual
    setTargets((prev) =>
      prev.map((t) => {
        if (t.id === target.id) {
          if (t.clicked) {
            // --- SEGUNDO CLIC O MÁS ---
            if (t.type === "talent") {
              setScore((s) => s + 1); // Puntos reducidos por spam
              addEffect(t.x + 5, t.y + 5, "talent-extra");
            }
            return t; // No hace nada más si es bomba o tiempo
          }

          // --- PRIMER CLIC (EL VALIOSO) ---
          addEffect(t.x + 5, t.y + 5, t.type);

          if (t.type === "bomb") {
            setScore((s) => Math.max(0, s - 50));
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          } else if (t.type === "time") {
            //setTimeLeft(s => Math.min(30, s + 5));
            setTimeLeft((s) => s + 5);
          } else {
            setScore((s) => s + 10);
          }

          // Marcamos como cliqueado pero NO lo borramos aún para permitir el "spam" de puntos
          // Excepto el reloj, que queremos que desaparezca rápido para no dar ventaja
          return { ...t, clicked: true };
        }
        return t;
      }),
    );

    // Si es tiempo o bomba, lo borramos un poco más rápido del array para evitar abusos
    if (target.type !== "talent") {
      setTimeout(() => {
        setTargets((prev) => prev.filter((t) => t.id !== target.id));
      }, 150);
    }
  }, []);

  const endGame = async () => {
    setGameState("ended");
    setTargets([]);
    const { data } = await supabaseClient.rpc("submit_game_score", {
      p_game_id: "hunter-talents",
      p_score: score,
      p_moves: 0,
      p_time_seconds: 0,
    });
    console.log(data);
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-dvh max-h-[750px] bg-neutral-50 dark:bg-neutral-950 overflow-hidden flex flex-col sm:rounded-[3rem] sm:mt-5 border-4 border-white dark:border-neutral-900 shadow-2xl touch-none mt-5">
      {/* 1. HEADER & PROGRESS BAR */}
      <div className="relative pt-6 px-6 pb-2 z-50">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} className="dark:text-white" />
          </button>
          <div className="flex gap-3">
           {timeLeft > 30 && ( <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-2xl font-black flex items-center gap-2 shadow-lg italic">
              <Timer size={16} /> {timeLeft}s
            </div>)}
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-2xl font-black flex items-center gap-2 shadow-lg italic">
              <Target size={16} /> {score}
            </div>
          </div>
        </div>

        {/* Barra de Tiempo Estilizada */}
        <div className="relative h-4 w-full bg-gray-100 dark:bg-neutral-900 rounded-full p-1 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              timeLeft > 15
                ? "bg-emerald-500"
                : timeLeft > 7
                  ? "bg-amber-500"
                  : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            }`}
            animate={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
          <Timer
            className="absolute -right-1 -top-1 text-neutral-400 bg-white dark:bg-neutral-950 rounded-full p-0.5"
            size={18}
          />
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Fondo con patrón de puntos (Grid) */}
        {/* FONDO SUTIL */}
        <motion.div
          className="absolute inset-0 opacity-[0.1] dark:opacity-[0.2] pointer-events-none text-neutral-900 dark:text-white"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "24px 24px"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Renderizado de Partículas */}
        {effects.map((eff) => (
          <Particles key={eff.id} x={eff.x} y={eff.y} color={eff.color} />
        ))}

        <AnimatePresence>
          {gameState === "playing" &&
            targets.map((t) => (
              <GameTarget key={t.id} t={t} onHit={handleHit} />
            ))}

          {gameState === "idle" && (
            <motion.div
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center z-10"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Zap size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-4xl font-black uppercase dark:text-white mb-4 italic">
                Caza Talentos
              </h2>
              <button
                onClick={() => {
                  const deck =
                    DECKS_DATA[Math.floor(Math.random() * DECKS_DATA.length)];
                  setCurrentDeck(deck);
                  setScore(0);
                  setTimeLeft(30);
                  setGameState("playing");
                  spawnTarget(deck);
                }}
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_10px_0_rgb(16,185,129)] active:shadow-none active:translate-y-[5px] transition-all"
              >
                ¡Jugar Ahora!
              </button>
            </motion.div>
          )}

          {gameState === "ended" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-10 bg-neutral-900/90 backdrop-blur-xl z-60 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <h2 className="text-7xl font-black text-emerald-500 mb-2">
                  {score}
                </h2>
                <p className="text-white font-black tracking-widest mb-10 text-xl uppercase">
                  ¡Puntuación Final!
                </p>
              </motion.div>
              <button
                onClick={() => setGameState("idle")}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase mb-4 active:scale-95 transition-transform"
              >
                Reiniciar
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-neutral-800 text-white py-4 rounded-2xl font-black uppercase active:scale-95 transition-transform"
              >
                Menú Principal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CazaTalentos;
