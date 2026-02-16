import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import { ArrowLeft, RefreshCw, Clock, VolumeX, Volume2 } from "lucide-react";
import { toast } from "sonner";
import useSound from "use-sound";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../../context/AudioContext";
import { notify } from "@/utils/toast/notifyv3";

// --- COMPONENTES ATÓMICOS MEMORIZADOS ---

// Celda individual del historial para evitar re-renders masivos
const HistoryCell = memo(({ colorId, themeOptions }) => {
  const colorObj = useMemo(
    () => themeOptions.find((c) => c.id === colorId),
    [colorId, themeOptions],
  );

  return (
    <div
      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
        colorObj ? colorObj.bg : "border-neutral-800 bg-neutral-950"
      }`}
    >
      {colorObj && <span className="text-xs">{colorObj.icon}</span>}
    </div>
  );
});

// Botón del selector de colores
const ColorOption = memo(({ color, onPick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => onPick(color.id)}
    className={`h-10 rounded-xl ${color.bg} flex items-center justify-center shadow-lg text-lg`}
  >
    {color.icon}
  </motion.button>
));

// --- CONSTANTES ---
const MAX_ATTEMPTS = 10;
const CODE_LENGTH = 4;
// (GAME_THEMES se mantiene igual fuera del componente para que no cambie su referencia)
const GAME_THEMES = [
  {
    name: "Facultades",
    primary: "text-emerald-500",
    border: "border-emerald-500",
    btn: "bg-emerald-500",
    options: [
      { id: "red", bg: "bg-red-500", icon: "🧪" },
      { id: "blue", bg: "bg-blue-500", icon: "⚖️" },
      { id: "green", bg: "bg-emerald-500", icon: "💻" },
      { id: "yellow", bg: "bg-amber-400", icon: "🎨" },
      { id: "purple", bg: "bg-purple-500", icon: "🧠" },
      { id: "orange", bg: "bg-orange-500", icon: "🏗️" },
    ],
  },
  {
    name: "Tecnología e IA",
    primary: "text-blue-400",
    border: "border-blue-400",
    btn: "bg-blue-400",
    options: [
      { id: "cpu", bg: "bg-slate-500", icon: "🤖" },
      { id: "cloud", bg: "bg-sky-400", icon: "☁️" },
      { id: "code", bg: "bg-indigo-500", icon: "⚡" },
      { id: "data", bg: "bg-cyan-500", icon: "📊" },
      { id: "sat", bg: "bg-violet-600", icon: "🛰️" },
      { id: "vr", bg: "bg-pink-500", icon: "👓" },
    ],
  },
  {
    name: "Vida Estudiantil",
    primary: "text-amber-400",
    border: "border-amber-400",
    btn: "bg-amber-400",
    options: [
      { id: "coffee", bg: "bg-orange-700", icon: "☕" },
      { id: "pizza", bg: "bg-red-400", icon: "🍕" },
      { id: "book", bg: "bg-lime-600", icon: "📚" },
      { id: "gym", bg: "bg-neutral-400", icon: "👟" },
      { id: "party", bg: "bg-yellow-400", icon: "🎉" },
      { id: "sleep", bg: "bg-indigo-900", icon: "💤" },
    ],
  },
];

const CodigoMatricula = () => {
  const navigate = useNavigate();

  const [currentTheme, setCurrentTheme] = useState(GAME_THEMES[0]);
  const [secretCode, setSecretCode] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [history, setHistory] = useState([]);
  const [gameState, setGameState] = useState("playing");
  const [timer, setTimer] = useState(0);
  const { isMuted, setIsMuted, playWithCheck } = useAudio();

  const [playPop] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.7 });
  const [playLose] = useSound("/sounds/lose.mp3", { volume: 0.6 });

  // 1. Memorizar inicio del juego
  const initGame = useCallback(() => {
    const randomTheme =
      GAME_THEMES[Math.floor(Math.random() * GAME_THEMES.length)];
    const code = Array.from(
      { length: CODE_LENGTH },
      () =>
        randomTheme.options[
          Math.floor(Math.random() * randomTheme.options.length)
        ].id,
    );
    setCurrentTheme(randomTheme);
    setSecretCode(code);
    setHistory([]);
    setCurrentGuess([]);
    setGameState("playing");
    setTimer(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // 2. Temporizador optimizado
  useEffect(() => {
    let interval;
    if (gameState === "playing") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // 3. Manejadores con useCallback
  const handleColorPick = useCallback(
    (colorId) => {
      setGameState((prev) => {
        if (prev !== "playing") return prev;
        setCurrentGuess((curr) =>
          curr.length < CODE_LENGTH ? [...curr, colorId] : curr,
        );
        playWithCheck(playPop);
        return prev;
      });
    },
    [playPop, playWithCheck],
  );

  const removeColor = useCallback(() => {
    setCurrentGuess((curr) => curr.slice(0, -1));
  }, []);

  const saveScore = useCallback(async (attempts, currentTime) => {
    const score = Math.max(1200 - attempts * 100, 200);
    try {
      const { error } = await supabaseClient.rpc("submit_game_score", {
        p_game_id: "mastermind",
        p_score: score,
        p_moves: attempts,
        p_time_seconds: currentTime,
      });
      if (error) {
        notify.error("Error al guardar el puntaje");
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== CODE_LENGTH) return;

    let correct = 0;
    let almost = 0;
    const secretCopy = [...secretCode];
    const guessCopy = [...currentGuess];

    // Lógica Mastermind
    guessCopy.forEach((color, i) => {
      if (color === secretCopy[i]) {
        correct++;
        secretCopy[i] = null;
        guessCopy[i] = "checked";
      }
    });

    guessCopy.forEach((color, i) => {
      if (color !== "checked") {
        const secretIndex = secretCopy.indexOf(color);
        if (secretIndex !== -1) {
          almost++;
          secretCopy[secretIndex] = null;
        }
      }
    });

    const newResult = { correct, almost };
    const newHistoryEntry = { guess: currentGuess, result: newResult };

    setHistory((prev) => {
      const updatedHistory = [...prev, newHistoryEntry];

      if (correct === CODE_LENGTH) {
        setGameState("won");
        playWithCheck(playWin);
        saveScore(updatedHistory.length, timer);
      } else if (updatedHistory.length >= MAX_ATTEMPTS) {
        setGameState("lost");
        playWithCheck(playLose);
      }
      return updatedHistory;
    });

    setCurrentGuess([]);
  }, [
    currentGuess,
    secretCode,
    playWin,
    playLose,
    saveScore,
    timer,
    playWithCheck,
  ]);

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
    <div className="max-w-md mx-auto p-4 flex flex-col h-full bg-neutral-950 rounded-[2.5rem] text-white overflow-hidden relative md:mt-5">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800"
          >
            <ArrowLeft size={20} />
          </button>
          {SoundToggle}
        </div>
        <div className="flex flex-col items-center">
          <h2
            className={`text-[10px] font-black uppercase tracking-widest ${currentTheme.primary} mb-1`}
          >
            {currentTheme.name}
          </h2>
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
            <Clock size={12} className={currentTheme.primary} />
            <span className="text-xs font-mono font-bold">{timer}s</span>
          </div>
        </div>
        <button
          onClick={initGame}
          className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      {/* Historial */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 px-2 no-scrollbar">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-2 rounded-2xl border ${history[i] ? "border-neutral-800 bg-neutral-900/50" : "border-neutral-900/10 opacity-40"}`}
          >
            <span className="text-[10px] font-bold text-neutral-600 w-4">
              {i + 1}
            </span>
            <div className="flex gap-2 flex-1">
              {Array.from({ length: CODE_LENGTH }).map((_, slot) => (
                <HistoryCell
                  key={slot}
                  colorId={history[i]?.guess[slot]}
                  themeOptions={currentTheme.options}
                />
              ))}
            </div>
            {/* Claves de acierto */}
            <div className="grid grid-cols-2 gap-1">
              {history[i] &&
                Array.from({ length: CODE_LENGTH }).map((_, s) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full ${
                      s < history[i].result.correct
                        ? "bg-emerald-500"
                        : s <
                            history[i].result.correct + history[i].result.almost
                          ? "bg-amber-400"
                          : "bg-neutral-700"
                    }`}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Panel de Control */}
      <footer className="bg-neutral-900 p-4 rounded-4xl border border-neutral-800 shadow-2xl">
        <div className="flex justify-between mb-4 gap-2">
          <div className="flex gap-2">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <motion.div
                key={i}
                onClick={removeColor}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl transition-all ${
                  currentGuess[i]
                    ? currentTheme.options.find((c) => c.id === currentGuess[i])
                        ?.bg + " border-transparent"
                    : "border-neutral-700 border-dashed"
                }`}
              >
                {
                  currentTheme.options.find((c) => c.id === currentGuess[i])
                    ?.icon
                }
              </motion.div>
            ))}
          </div>
          <button
            disabled={currentGuess.length !== CODE_LENGTH}
            onClick={submitGuess}
            className={`px-4 flex-1 rounded-2xl font-black uppercase text-[10px] ${
              currentGuess.length === CODE_LENGTH
                ? `${currentTheme.btn} text-black`
                : "bg-neutral-800 text-neutral-500 opacity-50"
            }`}
          >
            Enviar
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {currentTheme.options.map((color) => (
            <ColorOption
              key={color.id}
              color={color}
              onPick={handleColorPick}
            />
          ))}
        </div>
      </footer>

      {/* Modal Dinámico */}
      <AnimatePresence>
        {gameState !== "playing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 rounded-[2.5rem]"
          >
            <div
              className={`bg-neutral-900 border-2 ${currentTheme.border} p-8 rounded-[3rem] text-center w-full max-w-xs transition-colors duration-500`}
            >
              <div className="text-5xl mb-4">
                {gameState === "won" ? "🏆" : "🛰️"}
              </div>
              <h3 className="text-xl font-black uppercase mb-2">
                {gameState === "won" ? "¡HACK COMPLETADO!" : "ACCESO DENEGADO"}
              </h3>
              <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
                {gameState === "won"
                  ? `Descifraste el código de ${currentTheme.name.toLowerCase()} en ${
                      history.length
                    } pasos.`
                  : "El sistema ha rotado las llaves de acceso."}
              </p>
              <button
                onClick={initGame}
                className={`w-full ${currentTheme.btn} text-black py-4 rounded-2xl font-black uppercase text-sm`}
              >
                Siguiente Desafío
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodigoMatricula;
