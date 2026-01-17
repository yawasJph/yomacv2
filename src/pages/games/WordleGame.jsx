import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { supabaseClient } from "../../supabase/supabaseClient";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { VALID_WORDS } from "../../components/games/utils/dictionary";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import filteredWords from "../../../scripts/filtered_words.json";

// Configuración de colores
const COLORS = {
  correct: "bg-emerald-500 border-emerald-500 text-white", // Verde
  present: "bg-amber-500 border-amber-500 text-white", // Amarillo
  absent:
    "bg-gray-400 dark:bg-gray-600 border-gray-400 dark:border-gray-600 text-white", // Gris
  empty:
    "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-white",
  active: "border-emerald-400 dark:border-emerald-500 scale-105 shadow-md",
};

const toastStyle = {
  style: {
    borderRadius: "1.2rem",
    background: "#171717", // Neutral 900
    color: "#fff",
    border: "2px solid #10b981", // Emerald 500
    fontSize: "12px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "1px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
  },
};

const WordleGame = () => {
  const { user } = useAuth();
  const [targetWord, setTargetWord] = useState("");
  const [clue, setClue] = useState("");
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState(Array(6).fill("")); // Historial de palabras
  const [gameState, setGameState] = useState("playing"); // "playing", "won", "lost"
  const [usedLetters, setUsedLetters] = useState({}); // { A: 'correct', B: 'absent' }
  const [isInvalid, setIsInvalid] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const navigate = useNavigate();

  const shakeAnimation = {
    x: [-10, 10, -10, 10, -5, 5, 0], // Movimiento lateral
    transition: { duration: 0.4 }, // Velocidad de la sacudida
  };

  useEffect(() => {
    const loadDailyGame = async () => {
      const today = new Date().toISOString().split("T")[0];

      // 1. Obtener la palabra del día
      const { data: wordData } = await supabaseClient
        .from("daily_words")
        .select("*")
        .eq("scheduled_for", today)
        .maybeSingle();

      if (!wordData) return;
      const target = wordData.word.toUpperCase();
      setTargetWord(target);
      setClue(wordData.clue);

      // 2. Cargar progreso del usuario
      const { data: attemptData } = await supabaseClient
        .from("wordle_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("game_date", today)
        .maybeSingle();

      if (attemptData) {
        const savedGuesses = attemptData.guesses_json || [];
        // Rellenamos el array de guesses para mantener el tamaño 6
        setGuesses(
          savedGuesses.concat(Array(6 - savedGuesses.length).fill(""))
        );
        setCurrentRow(savedGuesses.length);
        setGameState(attemptData.status);
        if (attemptData.status === "won") {
          triggerConfetti(); // <-- Opcional: celebrar cada vez que abra el juego si ya ganó
        }

        // 3. RECONSTRUIR COLORES DEL TECLADO
        const used = {};
        savedGuesses.forEach((guess) => {
          guess.split("").forEach((char, i) => {
            if (char === target[i]) used[char] = "correct";
            else if (target.includes(char) && used[char] !== "correct")
              used[char] = "present";
            else if (!target.includes(char)) used[char] = "absent";
          });
        });
        setUsedLetters(used);
      }
    };

    if (user) loadDailyGame();
  }, [user]);

  const handleChar = (char) => {
    if (currentGuess.length < 5 && gameState === "playing") {
      setCurrentGuess((prev) => prev + char);
    }
  };

  const handleDelete = () => {
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  // Actualiza también handleEnter para que refresque el teclado en tiempo real
  const handleEnter = async () => {
    //if (currentGuess.length !== 5 || gameState !== "playing") return;
    if (gameState !== "playing") return;

    // 1. VALIDACIÓN DE LONGITUD (Menos de 5 letras)
    if (currentGuess.length < 5) {
      setIsInvalid(true);
      toast.error("Faltan letras", {
        ...toastStyle,
        icon: "⌨️",
        style: { ...toastStyle.style, border: "2px solid #f59e0b" }, // Borde ámbar para advertencia
      });
      setTimeout(() => setIsInvalid(false), 400);
      return;
    }

    const wordToValidate = currentGuess.toUpperCase();
    if (
      !filteredWords.includes(wordToValidate) &&
      wordToValidate !== targetWord
    ) {
      setIsInvalid(true);
      toast.info("No está en el diccionario", {
        ...toastStyle,
        icon: "📚",
      });
      setTimeout(() => setIsInvalid(false), 400);
      return;
    }

    // 1. Calcular colores para el teclado inmediatamente
    const newUsedLetters = { ...usedLetters };
    wordToValidate.split("").forEach((char, i) => {
      if (char === targetWord[i]) newUsedLetters[char] = "correct";
      else if (targetWord.includes(char) && newUsedLetters[char] !== "correct")
        newUsedLetters[char] = "present";
      else if (!targetWord.includes(char)) newUsedLetters[char] = "absent";
    });

    const newGuesses = [...guesses];
    newGuesses[currentRow] = wordToValidate;
    const currentGuessesToSave = newGuesses.filter((g) => g !== "");

    let newStatus = "playing";
    if (wordToValidate === targetWord) newStatus = "won";
    else if (currentRow === 5) newStatus = "lost";

    const { error } = await supabaseClient.from("wordle_attempts").upsert(
      {
        user_id: user.id,
        game_date: new Date().toISOString().split("T")[0],
        guesses_json: currentGuessesToSave,
        attempts: currentGuessesToSave.length,
        status: newStatus,
        score:
          newStatus === "won" ? (7 - currentGuessesToSave.length) * 100 : 0,
      },
      { onConflict: "user_id, game_date" }
    );

    if (!error) {
      setGuesses(newGuesses);
      setUsedLetters(newUsedLetters); // Actualizamos el teclado visual
      if (newStatus !== "playing") {
        setGameState(newStatus);
        if (newStatus === "won") {
          triggerConfetti();
          await supabaseClient.rpc("submit_game_score", {
            p_game_id: "wordle_diario",
            p_moves: currentGuessesToSave.length,
            p_score: (7 - currentGuessesToSave.length) * 100,
            p_time_seconds: 0,
          });
        }
      } else {
        setCurrentRow((prev) => prev + 1);
        setCurrentGuess("");
      }
    }
  };

  // Escuchar teclado físico también
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Enter") handleEnter();
      else if (e.key === "Backspace") handleDelete();
      else if (/^[a-zA-ZñÑ]$/.test(e.key)) handleChar(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentGuess, currentRow, gameState]);

  // 1. Cargar palabra del día
  useEffect(() => {
    const fetchTodayWord = async () => {
      const { data } = await supabaseClient
        .from("daily_words")
        .select("*")
        .eq("scheduled_for", new Date().toISOString().split("T")[0])
        .maybeSingle();

      if (data) {
        setTargetWord(data.word.toUpperCase());
        setClue(data.clue);
      }
    };
    fetchTodayWord();
  }, []);

  const shareResults = () => {
    const emojiGrid = guesses
      .filter((g) => g !== "")
      .map((guess) => {
        return guess
          .split("")
          .map((char, i) => {
            if (char === targetWord[i]) return "🟩";
            if (targetWord.includes(char)) return "🟨";
            return "⬜";
          })
          .join("");
      })
      .join("\n");

    const text = `Palabra del Día #Campus\n${currentRow + 1}/6\n\n${emojiGrid}`;

    navigator.clipboard.writeText(text);
    toast.info("¡Resultados copiados al portapapeles!");
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Disparo desde la izquierda
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      // Disparo desde la derecha
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto p-4 justify-center">
      {/**min-h-[80vh] */}
      {/* Header con Pista */}
      <div className="w-full flex justify-between items-center mb-8 max-sm:mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-3 text-black rounded-2xl dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black italic uppercase dark:text-white tracking-tighter">
          Palabra Del <span className="text-emerald-500">Día</span>
        </h1>
        <button
          onClick={() => setShowClue(true)}
          className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-400 hover:text-amber-500 transition-colors"
        >
          <HelpCircle size={20} />
        </button>
      </div>

      {/* Grid del Juego */}
      <div className="grid grid-rows-6 gap-2 mb-8 max-sm:mb-0">
        {guesses.map((guess, i) => (
          <motion.div
            key={i}
            animate={i === currentRow && isInvalid ? shakeAnimation : {}}
          >
            <Row
              guess={i === currentRow ? currentGuess : guess}
              isCurrent={i === currentRow}
              isSubmitted={i < currentRow}
              targetWord={targetWord}
            />
          </motion.div>
        ))}
      </div>

      {/* Teclado */}
      <div className="w-full">
        <Keyboard
          onChar={handleChar}
          onDelete={handleDelete}
          onEnter={handleEnter}
          usedLetters={usedLetters}
        />
      </div>

      {/* MODALES (Pista y Victoria/Derrota) */}
      <AnimatePresence>
        {/* 1. Modal de Pista */}
        {showClue && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClue(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-neutral-800 max-w-xs w-full text-center"
            >
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle
                  className="text-amber-600 dark:text-amber-400"
                  size={32}
                />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white mb-2">
                Pista del día
              </h3>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-neutral-700">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 italic">
                  "{clue || "No hay pistas para hoy"}"
                </span>
              </div>
              <button
                onClick={() => setShowClue(false)}
                className="mt-6 w-full bg-neutral-900 dark:bg-white dark:text-black text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}

        {/* 2. Modal de Resultado (Victoria/Derrota) */}
        {gameState !== "playing" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white dark:bg-neutral-900 p-8 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border border-gray-100 dark:border-neutral-800"
            >
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                  gameState === "won"
                    ? "bg-emerald-100 dark:bg-emerald-500/20"
                    : "bg-red-100 dark:bg-red-500/20"
                }`}
              >
                <span className="text-4xl">
                  {gameState === "won" ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-4xl"
                    >
                      🏆
                    </motion.div>
                  ) : (
                    "💀"
                  )}
                </span>
              </div>

              <h2 className="text-3xl font-black uppercase tracking-tighter dark:text-white mb-2">
                {gameState === "won" ? "¡Increíble!" : "Gáme Over"}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase mb-2">
                {gameState === "won"
                  ? `Lo lograste en ${currentRow} ${
                      currentRow === 1 ? "intento" : "intentos"
                    }`
                  : `La palabra era: ${targetWord}`}
              </p>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-[12px] mb-6">
                vuelve mañana para la siguiente palabra
              </p>

              <div className="flex flex-col gap-3">
                {gameState === "won" && (
                  <button
                    onClick={shareResults}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                  >
                    Compartir Resultados 🚀
                  </button>
                )}

                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-transform active:scale-95"
                >
                  Volver al Arcade
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Row = ({ guess, isCurrent, isSubmitted, targetWord }) => {
  const letters = guess.padEnd(5, " ").split("");

  return (
    <div className="grid grid-cols-5 gap-2">
      {letters.map((char, i) => {
        let statusClass = COLORS.empty;

        if (isSubmitted) {
          if (char === targetWord[i]) {
            statusClass = COLORS.correct;
          } else if (targetWord.includes(char)) {
            statusClass = COLORS.present;
          } else {
            statusClass = COLORS.absent;
          }
        } else if (isCurrent && char !== " ") {
          statusClass =
            "border-gray-400 dark:border-neutral-500 scale-105 shadow-sm dark:text-white";
        }

        return (
          <motion.div
            key={i}
            initial={isSubmitted ? { rotateX: -90 } : false}
            animate={
              isSubmitted ? { rotateX: 0 } : { scale: char !== " " ? 1.05 : 1 }
            }
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={`w-14 h-14 md:w-16 md:h-16 border-2 rounded-2xl flex items-center justify-center text-2xl font-black transition-colors ${statusClass}`}
          >
            {char.toUpperCase()}
          </motion.div>
        );
      })}
    </div>
  );
};

const Keyboard = ({ onChar, onDelete, onEnter, usedLetters }) => {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DELETE"],
  ];

  const getKeyStyle = (key) => {
    if (usedLetters[key] === "correct") return "bg-emerald-500 text-white";
    if (usedLetters[key] === "present") return "bg-amber-500 text-white";
    if (usedLetters[key] === "absent")
      return "bg-gray-400 dark:bg-neutral-700 text-white opacity-40";
    return "bg-gray-200 dark:bg-neutral-800 dark:text-gray-200";
  };

  return (
    <div className="w-full max-w-lg mt-8 max-sm:mt-3 px-1">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5 mb-2 touch-none">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === "ENTER") onEnter();
                else if (key === "DELETE") onDelete();
                else onChar(key);
              }}
              className={`
                ${key.length > 1 ? "px-3 text-[10px]" : "flex-1 text-sm"}
                h-12 rounded-lg font-black transition-all active:scale-95
                ${getKeyStyle(key)}
              `}
            >
              {key === "DELETE" ? "⌫" : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default WordleGame;
