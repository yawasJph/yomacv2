import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  RefreshCw,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import useSound from "use-sound";

const COLORS = [
  { id: "red", bg: "bg-red-500", icon: "🧪" }, // Medicina
  { id: "blue", bg: "bg-blue-500", icon: "⚖️" }, // Derecho
  { id: "green", bg: "bg-emerald-500", icon: "💻" }, // Ingeniería
  { id: "yellow", bg: "bg-amber-400", icon: "🎨" }, // Artes
  { id: "purple", bg: "bg-purple-500", icon: "🧠" }, // Psico
  { id: "orange", bg: "bg-orange-500", icon: "🏗️" }, // Arquitectura
];

const MAX_ATTEMPTS = 10;
const CODE_LENGTH = 4;

const CodigoMatricula = ({ onBack }) => {
  const { user } = useAuth();
  const [secretCode, setSecretCode] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [history, setHistory] = useState([]); // { guess: [], result: { correct: 0, almost: 0 } }
  const [gameState, setGameState] = useState("playing"); // playing, won, lost
  const [timer, setTimer] = useState(0);

  // Sonidos (Asegúrate de tenerlos en /public/sounds)
  const [playPop] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.7 });
  const [playLose] = useSound("/sounds/lose.mp3", { volume: 0.6 });

  // Timer: se activa solo mientras se juega
  useEffect(() => {
    let interval;
    if (gameState === "playing") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const initGame = useCallback(() => {
    const code = Array.from(
      { length: CODE_LENGTH },
      () => COLORS[Math.floor(Math.random() * COLORS.length)].id
    );
    setSecretCode(code);
    setHistory([]);
    setCurrentGuess([]);
    setGameState("playing");
    setTimer(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleColorPick = (colorId) => {
    if (gameState !== "playing" || currentGuess.length >= CODE_LENGTH) return;
    playPop();
    setCurrentGuess([...currentGuess, colorId]);
  };

  const removeColor = () => {
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const submitGuess = () => {
    if (currentGuess.length !== CODE_LENGTH) return;

    // Lógica de validación
    let correct = 0;
    let almost = 0;
    const secretCopy = [...secretCode];
    const guessCopy = [...currentGuess];

    // Primero contar los exactos
    guessCopy.forEach((color, i) => {
      if (color === secretCopy[i]) {
        correct++;
        secretCopy[i] = null;
        guessCopy[i] = "checked";
      }
    });

    // Luego contar los que están pero en otra posición
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
    const newHistory = [...history, { guess: currentGuess, result: newResult }];
    setHistory(newHistory);
    setCurrentGuess([]);

    if (correct === CODE_LENGTH) {
      setGameState("won");
      playWin();
      saveScore(newHistory.length);
    } else if (newHistory.length >= MAX_ATTEMPTS) {
      setGameState("lost");
      playLose();
      console.log("poits: ", newHistory.length, timer);
    }
  };

  const saveScore = async (attempts) => {
    const score = Math.max(1200 - attempts * 100, 200);
    await supabaseClient.from("leaderboards").insert({
      user_id: user.id,
      game_id: "mastermind",
      score: score,
    });
    toast.success("¡Código descifrado! Ranking actualizado.");
    console.log("poits: ", score, attempts);
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col h-full bg-neutral-950 rounded-[2.5rem] text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1">
            Sistema de Matrícula
          </h2>
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
            <Clock size={12} className="text-emerald-500" />
            <span className="text-xs font-mono font-bold">{timer}s</span>
          </div>
        </div>

        <button
          onClick={initGame}
          className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Historial de Intentos */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 px-2 no-scrollbar">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
          const attempt = history[i];
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-2 rounded-2xl border ${
                attempt
                  ? "border-neutral-800 bg-neutral-900/50"
                  : "border-neutral-900/30"
              }`}
            >
              <span className="text-[10px] font-bold text-neutral-600 w-4">
                {i + 1}
              </span>
              <div className="flex gap-2 flex-1">
                {Array.from({ length: CODE_LENGTH }).map((_, slot) => {
                  const colorId = attempt?.guess[slot];
                  const colorObj = COLORS.find((c) => c.id === colorId);
                  return (
                    <div
                      key={slot}
                      className={`w-8 h-8 rounded-full border-2 ${
                        colorObj
                          ? colorObj.bg
                          : "border-neutral-800 bg-neutral-950"
                      }`}
                    >
                      {colorObj && (
                        <span className="text-xs flex items-center justify-center h-full">
                          {colorObj.icon}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Pistas */}
              <div className="grid grid-cols-2 gap-1">
                {attempt &&
                  Array.from({ length: CODE_LENGTH }).map((_, s) => (
                    <div
                      key={s}
                      className={`w-2 h-2 rounded-full ${
                        s < attempt.result.correct
                          ? "bg-emerald-500"
                          : s < attempt.result.correct + attempt.result.almost
                          ? "bg-amber-400"
                          : "bg-neutral-700"
                      }`}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Actual */}
      <div className="bg-neutral-900 p-4 rounded-[2rem] border border-neutral-800 shadow-2xl">
        <div className="flex justify-between mb-4">
          <div className="flex gap-3">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const colorObj = COLORS.find((c) => c.id === currentGuess[i]);
              return (
                <motion.div
                  key={i}
                  onClick={removeColor}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl shadow-inner
                    ${
                      colorObj
                        ? colorObj.bg + " border-transparent"
                        : "border-neutral-700 border-dashed"
                    }`}
                >
                  {colorObj?.icon}
                </motion.div>
              );
            })}
          </div>
          <button
            disabled={currentGuess.length !== CODE_LENGTH}
            onClick={submitGuess}
            className={`px-6 rounded-2xl font-black uppercase text-xs transition-all
              ${
                currentGuess.length === CODE_LENGTH
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "bg-neutral-800 text-neutral-500 opacity-50"
              }`}
          >
            Enviar
          </button>
        </div>

        {/* Selector de Colores */}
        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((color) => (
            <motion.button
              key={color.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleColorPick(color.id)}
              className={`h-10 rounded-xl ${color.bg} flex items-center justify-center shadow-lg`}
            >
              {color.icon}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modal de Resultado (Similar al de BuscaMinas) */}
      <AnimatePresence>
        {gameState !== "playing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 rounded-[2.5rem]"
          >
            <div className="bg-neutral-900 border-2 border-emerald-500 p-8 rounded-[3rem] text-center w-full max-w-xs">
              <div className="text-5xl mb-4">
                {gameState === "won" ? "🎓" : "📑"}
              </div>
              <h3 className="text-2xl font-black uppercase mb-2">
                {gameState === "won" ? "¡HACK EXITOSO!" : "SISTEMA BLOQUEADO"}
              </h3>
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-6">
                {gameState === "won"
                  ? `Lograste matricularte en ${history.length} intentos.`
                  : "Te quedaste sin cupos este semestre."}
              </p>
              <button
                onClick={initGame}
                className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase"
              >
                Reiniciar Sistema
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodigoMatricula;
