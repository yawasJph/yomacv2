import { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { supabaseClient } from "../../supabase/supabaseClient";
import { ArrowLeft, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import filteredWords from "../../../scripts/filtered_words.json";
import { useAudio } from "../../context/AudioContext";
import useSound from "use-sound";

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

const shakeAnimation = {
  x: [-10, 10, -10, 10, -5, 5, 0], // Movimiento lateral
  transition: { duration: 0.4 }, // Velocidad de la sacudida
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
  const { isMuted, setIsMuted, playWithCheck } = useAudio();

  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playDelete] = useSound("/sounds/delete.mp3", { volume: 0.5 });
  const [playMatched] = useSound("/sounds/matched.mp3", { volume: 0.5 });
  const [playError] = useSound("/sounds/lose.mp3", { volume: 0.3 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.5 });
  const [playLose] = useSound("/sounds/losev4.mp3", { volume: 0.4 });

  useEffect(() => {
    const initGame = async () => {
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];

      // 1. Ejecutamos ambas consultas en paralelo para ganar velocidad
      const [wordRes, attemptRes] = await Promise.all([
        supabaseClient
          .from("daily_words")
          .select("*")
          .eq("scheduled_for", today)
          .maybeSingle(),
        supabaseClient
          .from("wordle_attempts")
          .select("*")
          .eq("user_id", user.id)
          .eq("game_date", today)
          .maybeSingle(),
      ]);

      // 2. Configurar la palabra del día
      if (wordRes.data) {
        const target = wordRes.data.word.toUpperCase();
        setTargetWord(target);
        setClue(wordRes.data.clue);

        // 3. Si hay progreso previo, procesarlo
        if (attemptRes.data) {
          const savedGuesses = attemptRes.data.guesses_json || [];

          // Rellenar tablero
          setGuesses(
            savedGuesses.concat(Array(6 - savedGuesses.length).fill("")),
          );
          setCurrentRow(savedGuesses.length);
          setGameState(attemptRes.data.status);

          // Reconstruir teclado (Usamos un reducer para que sea más limpio)
          const used = savedGuesses.reduce((acc, guess) => {
            guess.split("").forEach((char, i) => {
              if (char === target[i]) acc[char] = "correct";
              else if (target.includes(char) && acc[char] !== "correct")
                acc[char] = "present";
              else if (!target.includes(char)) acc[char] = "absent";
            });
            return acc;
          }, {});

          setUsedLetters(used);

          if (attemptRes.data.status === "won") triggerConfetti();
        }
      }
    };

    initGame();
  }, [user]); // Quitamos dependencias innecesarias para evitar loops

  // const handleChar = (char) => {
  //   if (currentGuess.length < 5 && gameState === "playing") {
  //     playWithCheck(playClick);
  //     setCurrentGuess((prev) => prev + char);
  //   }
  // };

  // 1. MEMORIZAR FUNCIONES PARA NO ROMPER EL MEMO DEL TECLADO

  const handleChar = useCallback(
    (char) => {
      if (gameState === "playing") {
        // Quitamos dependencia de currentGuess.length para el callback
        setCurrentGuess((prev) => (prev.length < 5 ? prev + char : prev));
        playWithCheck(playClick);
      }
    },
    [gameState, playClick, playWithCheck],
  );

  const handleDelete = useCallback(() => {
    setCurrentGuess((prev) => prev.slice(0, -1));
    playWithCheck(playDelete);
  }, [playDelete, playWithCheck]);

  // Actualiza también handleEnter para que refresque el teclado en tiempo real
  // const handleEnter = async () => {
  //   //if (currentGuess.length !== 5 || gameState !== "playing") return;
  //   if (gameState !== "playing") return;

  //   // 1. VALIDACIÓN DE LONGITUD (Menos de 5 letras)
  //   if (currentGuess.length < 5) {
  //     setIsInvalid(true);
  //     playWithCheck(playError);
  //     toast.error("Faltan letras", {
  //       ...toastStyle,
  //       icon: "⌨️",
  //       style: { ...toastStyle.style, border: "2px solid #f59e0b" }, // Borde ámbar para advertencia
  //     });
  //     setTimeout(() => setIsInvalid(false), 400);
  //     return;
  //   }

  //   const wordToValidate = currentGuess.toUpperCase();

  //   if (
  //     !filteredWords.includes(wordToValidate) &&
  //     wordToValidate !== targetWord
  //   ) {
  //     setIsInvalid(true);
  //     playWithCheck(playError);
  //     toast.info("No está en el diccionario", {
  //       ...toastStyle,
  //       icon: "📚",
  //     });
  //     setTimeout(() => setIsInvalid(false), 400);
  //     return;
  //   }

  //   // 1. Calcular colores para el teclado inmediatamente
  //   const newUsedLetters = { ...usedLetters };
  //   wordToValidate.split("").forEach((char, i) => {
  //     if (char === targetWord[i]) newUsedLetters[char] = "correct";
  //     else if (targetWord.includes(char) && newUsedLetters[char] !== "correct")
  //       newUsedLetters[char] = "present";
  //     else if (!targetWord.includes(char)) newUsedLetters[char] = "absent";
  //   });

  //   const newGuesses = [...guesses];
  //   newGuesses[currentRow] = wordToValidate;
  //   const currentGuessesToSave = newGuesses.filter((g) => g !== "");

  //   const newStatus =
  //     wordToValidate === targetWord
  //       ? "won"
  //       : currentRow === 5
  //         ? "lost"
  //         : "playing";

  //   // Sonido según resultado
  //   if (newStatus === "won") {
  //     playWithCheck(playWin);
  //   } else if (newStatus === "lost") {
  //     playWithCheck(playLose);
  //   } else {
  //     setTimeout(() => {
  //       playWithCheck(playMatched);
  //     }, 500); // Sonido de "palabra aceptada"
  //   }

  //   const { error } = await supabaseClient.from("wordle_attempts").upsert(
  //     {
  //       user_id: user.id,
  //       game_date: new Date().toISOString().split("T")[0],
  //       guesses_json: currentGuessesToSave,
  //       attempts: currentGuessesToSave.length,
  //       status: newStatus,
  //       score:
  //         newStatus === "won" ? (7 - currentGuessesToSave.length) * 100 : 0,
  //     },
  //     { onConflict: "user_id, game_date" },
  //   );

  //   if (!error) {
  //     setGuesses(newGuesses);
  //     setUsedLetters(newUsedLetters); // Actualizamos el teclado visual
  //     if (newStatus !== "playing") {
  //       setGameState(newStatus);
  //       if (newStatus === "won") {
  //         triggerConfetti();
  //         await supabaseClient.rpc("submit_game_score", {
  //           p_game_id: "wordle_diario",
  //           p_moves: currentGuessesToSave.length,
  //           p_score: (7 - currentGuessesToSave.length) * 100,
  //           p_time_seconds: 0,
  //         });
  //       }
  //     } else {
  //       setCurrentRow((prev) => prev + 1);
  //       setCurrentGuess("");
  //     }
  //   }
  // };

  // handleEnter requiere más dependencias, pero es vital para el flujo
  const handleEnter = useCallback(async () => {
    if (gameState !== "playing") return;

    if (currentGuess.length < 5) {
      setIsInvalid(true);
      playWithCheck(playError);
      toast.error("Faltan letras", { ...toastStyle, icon: "⌨️" });
      setTimeout(() => setIsInvalid(false), 400);
      return;
    }

    const wordToValidate = currentGuess.toUpperCase();

    // Validación de diccionario...
    if (
      !filteredWords.includes(wordToValidate) &&
      wordToValidate !== targetWord
    ) {
      setIsInvalid(true);
      playWithCheck(playError);
      toast.info("No está en el diccionario", { ...toastStyle, icon: "📚" });
      setTimeout(() => setIsInvalid(false), 400);
      return;
    }

    const newStatus =
      wordToValidate === targetWord
        ? "won"
        : currentRow === 5
          ? "lost"
          : "playing";

    // Sonidos inmediatos
    if (newStatus === "won") playWithCheck(playWin);
    else if (newStatus === "lost") playWithCheck(playLose);

    // Cálculos de teclado
    const newUsedLetters = { ...usedLetters };
    wordToValidate.split("").forEach((char, i) => {
      if (char === targetWord[i]) newUsedLetters[char] = "correct";
      else if (targetWord.includes(char) && newUsedLetters[char] !== "correct")
        newUsedLetters[char] = "present";
      else if (!targetWord.includes(char)) newUsedLetters[char] = "absent";
    });

    // RETRASO TÁCTICO: Para que la UI no se bloquee mientras Supabase responde
    setTimeout(async () => {
      if (newStatus === "playing") playWithCheck(playMatched);

      const newGuesses = [...guesses];
      newGuesses[currentRow] = wordToValidate;
      const currentGuessesToSave = newGuesses.filter((g) => g !== "");

      // Actualización de DB
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
        { onConflict: "user_id, game_date" },
      );

      if (!error) {
        setGuesses(newGuesses);
        setUsedLetters(newUsedLetters); // El teclado se actualiza aquí

        if (newStatus !== "playing") {
          setGameState(newStatus);
          if (newStatus === "won") triggerConfetti();
        } else {
          setCurrentRow((prev) => prev + 1);
          setCurrentGuess("");
        }
      }
    }, 100);
  }, [currentGuess, currentRow, gameState, targetWord, usedLetters, user]);

  // 2. TECLADO FÍSICO OPTIMIZADO
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Enter") handleEnter();
      else if (e.key === "Backspace") handleDelete();
      else if (/^[a-zA-ZñÑ]$/.test(e.key)) handleChar(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleEnter, handleDelete, handleChar]);

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
    <div className="flex flex-col  max-w-md p-3 overflow-hidden mx-auto">
      {/* 1. Header: Altura fija mínima */}
      <header className="flex-none flex justify-between items-center sm:py-2 sm:mb-2">
        <button onClick={() => navigate(-1)} className="p-2 dark:text-white">
          <ArrowLeft size={20} />
        </button>

        {/* Versión mini del toggle de sonido para ahorrar espacio */}
        {SoundToggle}

        <h1 className="text-lg font-black italic uppercase dark:text-white leading-none">
          Palabra Del <span className="text-amber-500">Día</span>
        </h1>

        <button onClick={() => setShowClue(true)} className="p-2 text-gray-400">
          <HelpCircle size={20} />
        </button>
      </header>

      {/* 2. Grid del Juego: flex-grow para que ocupe el espacio central */}
      <main className="grow flex items-center justify-center overflow-hidden mt-3">
        <div className="grid grid-rows-6 gap-1.5 md:gap-2">
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
      </main>

      {/* 3. Teclado: Altura fija abajo */}
      <footer className="flex-none w-full mt-3">
        <Keyboard
          onChar={handleChar}
          onDelete={handleDelete}
          onEnter={handleEnter}
          usedLetters={usedLetters}
        />
      </footer>

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
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 italic">
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

const Row = memo(({ guess, isCurrent, isSubmitted, targetWord }) => {
  const letters = guess.padEnd(5, " ").split("");

  return (
    <div className="grid grid-cols-5 gap-2" style={{ perspective: "1000px" }}>
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
});

const Keyboard = memo(({ onChar, onDelete, onEnter, usedLetters }) => {
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
});

export default WordleGame;
