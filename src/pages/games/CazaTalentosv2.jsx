import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import {
  Timer,
  Target,
  Zap,
  ArrowLeft,
  Trophy,
  VolumeX,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DECKS_DATA from "../../assets/data-game/barajas.json";
import { useAudio } from "../../context/AudioContext";
import useSound from "use-sound";

// --- COMPONENTE TARGET (Separado para evitar re-renders del grid) ---

const Particles = memo(({ x, y, color }) => {
  const particles = Array.from({ length: 8 });
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {particles.map((_, i) => {
        const angle = i * 36 * (Math.PI / 180); 
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
    className={`absolute flex items-center justify-center overflow-hidden shadow-xl rounded-2xl border-2 transition-transform will-change-transform cursor-crosshair ${
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

    {t.clicked && t.type === "bomb" && (
      <span className="text-xs font-black text-red-600">-50</span>
    )}

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

const GAME_DURATION = 30;

const getRank = (points) => {
  if (points >= 2500)
    return {
      label: "ZAFIRO",
      color: "text-indigo-400",
      gradient: "from-indigo-500 to-cyan-400",
      bg: "bg-indigo-500/10",
      icon: "💎",
    };
  if (points >= 2000)
    return {
      label: "RUBÍ",
      color: "text-red-400",
      gradient: "from-red-500 to-pink-400",
      bg: "bg-red-500/10",
      icon: "🌹",
    };
  if (points >= 1500)
    return {
      label: "DIAMANTE",
      color: "text-cyan-400",
      gradient: "from-cyan-500 to-sky-400",
      bg: "bg-cyan-500/10",
      icon: "✨",
    };
  if (points >= 1000)
    return {
      label: "ORO",
      color: "text-amber-400",
      gradient: "from-amber-500 to-yellow-400",
      bg: "bg-amber-500/10",
      icon: "👑",
    };
  if (points >= 500)
    return {
      label: "PLATA",
      color: "text-slate-400",
      gradient: "from-slate-400 to-gray-300",
      bg: "bg-slate-500/10",
      icon: "🥈",
    };
  return {
    label: "BRONCE",
    color: "text-orange-600",
    gradient: "from-orange-500 to-red-400",
    bg: "bg-orange-500/10",
    icon: "🥉",
  };
};

const CazaTalentos = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState("idle");
  const [targets, setTargets] = useState([]);
  const [effects, setEffects] = useState([]); // Para las partículas
  const [currentDeck, setCurrentDeck] = useState(null);
  const { isMuted, setIsMuted, playWithCheck } = useAudio();
  const navigate = useNavigate();

  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playTime] = useSound("/sounds/time.mp3", { volume: 0.5 });
  const [playBomb] = useSound("/sounds/bombv2.mp3", { volume: 0.5 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.5 });

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
      let timeChance = 0.12; // 20% inicial
      let bombChance = 0.15; // 15% inicial
      let lifespan = 1500; // 1.8 segundos iniciales

      if (score > 500) {
        timeChance = 0.09;
        bombChance = 0.2;
        lifespan = 1200;
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

  const handleHit = useCallback(
    (target) => {
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
              playWithCheck(playBomb);
              setScore((s) => Math.max(0, s - 50));
              if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            } else if (t.type === "time") {
              //setTimeLeft(s => Math.min(30, s + 5));
              playWithCheck(playTime);
              setTimeLeft((s) => s + 5);
            } else {
              playWithCheck(playClick);
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
    },
    [playWithCheck, playBomb, playTime, playClick],
  );

  const endGame = async () => {
    setGameState("ended");
    setTargets([]);
    playWithCheck(playWin);
    const { data } = await supabaseClient.rpc("submit_game_score", {
      p_game_id: "hunter-talents",
      p_score: score,
      p_moves: 0,
      p_time_seconds: 0,
    });
  };

  // Botón de sonido reutilizable
  const SoundToggle = (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setIsMuted(!isMuted)}
      className={`p-2 rounded-2xl transition-all shadow-lg ${
        isMuted
          ? "bg-gray-500 text-white"
          : "bg-white dark:bg-neutral-900 text-amber-500 border border-amber-500/20"
      }`}
    >
      {isMuted ? (
        <VolumeX size={24} />
      ) : (
        <Volume2 size={24} className="animate-pulse" />
      )}
    </motion.button>
  );

  return (
    <div className="relative w-full max-w-md mx-auto h-[700px] bg-neutral-50 dark:bg-neutral-950 overflow-hidden flex flex-col sm:rounded-[3rem] sm:mt-5 border-4 border-white dark:border-neutral-900 shadow-2xl touch-none mt-5">
      
      
      {/* 1. HEADER & PROGRESS BAR */}
      
        <div className="relative pt-6 px-6 pb-2 z-20">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full active:scale-90 transition-transform"
              >
                <ArrowLeft size={20} className="dark:text-white" />
              </button>
              {SoundToggle}
            </div>

            <div className="flex gap-3">
              {timeLeft > 30 && (
                <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-2xl font-black flex items-center gap-2 shadow-lg italic">
                  <Timer size={16} /> {timeLeft}s
                </div>
              )}
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
          className="absolute inset-0 opacity-[0.1] dark:opacity-[0.2] pointer-events-none text-black dark:text-white"
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
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce cursor-crosshair">
                <Target size={48} className="text-emerald-500" />
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
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-neutral-950/98 backdrop-blur-2xl z-60 text-center"
            >
              {/* Icono Central con Brillo Radial */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="relative mb-8"
              >
                <div
                  className={`absolute inset-0 ${getRank(score).bg} blur-[60px] opacity-30 rounded-full animate-pulse`}
                />
                <div
                  className={`relative bg-linear-to-br ${getRank(score).gradient} p-7 rounded-[2.5rem] shadow-2xl `}
                >
                  <Trophy className="text-white w-14 h-14" />
                </div>

                {/* Badge de Rango Dinámico */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full border border-white/10 shadow-2xl ${getRank(score).bg} backdrop-blur-md whitespace-nowrap`}
                >
                  <span
                    className={`text-[10px] font-black tracking-[0.2em] ${getRank(score).color}`}
                  >
                    RANGO {getRank(score).label}
                  </span>
                </motion.div>
              </motion.div>

              {/* Contador de Puntos con Estilo Arcade */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-10"
              >
                <h2 className="text-7xl font-black text-white tracking-tighter italic">
                  {score}
                </h2>
                <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">
                  Puntos Totales
                </p>
              </motion.div>

              {/* Grid de Estadísticas con los rangos */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
                <div className="bg-neutral-900/50 p-4 rounded-3xl border border-neutral-800 flex flex-col items-center">
                  <Target className="text-blue-500 mb-2" size={20} />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    Estado
                  </span>
                  <span className="text-lg font-black text-white">
                    {getRank(score).icon}
                  </span>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-3xl border border-neutral-800 flex flex-col items-center">
                  <Zap className="text-amber-500 mb-2" size={20} />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    Bonos
                  </span>
                  <span className="text-lg font-black text-white">
                    +{Math.floor(score / 100)}
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setScore(0);
                    setTimeLeft(30);
                    setGameState("playing");
                    const deck =
                      DECKS_DATA[Math.floor(Math.random() * DECKS_DATA.length)];
                    setCurrentDeck(deck);
                    spawnTarget(deck);
                  }}
                  className="py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Zap size={18} fill="currentColor" /> Reintentar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(-1)}
                  className="py-4 bg-neutral-900 text-neutral-400 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-neutral-800"
                >
                  Menu Principal
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CazaTalentos;
