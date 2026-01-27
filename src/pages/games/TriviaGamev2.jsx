import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Timer as TimerIcon, Zap, AlertCircle } from "lucide-react";
import ResultsView from "../../components/games/ResultsView";
import { useProfile } from "../../hooks/useProfile";
import { useTriviaGame } from "../../hooks/trivia/useTriviaGame";
import { useCountdown } from "../../hooks/trivia/useCountdown";

const TriviaGame = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const {
    gameState,
    setGameState,
    currentIndex,
    selectedOption,
    isCorrect,
    showBoost,
    questions,
    activeCategory,
    currentQuestion: currentQ,
    score,
    points,
    streak,
    lastPointsEarned,
    timeLeft,
    handleAnswer,
    handleReset,
  } = useTriviaGame(profile);

  const { countdown, startCountdown } = useCountdown(3, () => {
    setGameState("playing");
  });

  // Iniciar countdown cuando el estado cambie a "starting"
  useEffect(() => {
    if (gameState === "starting") {
      startCountdown();
    }
  }, [gameState]);

  // 1. Pantalla de Carga Inicial
  if (gameState === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-gray-500 dark:text-gray-400 font-black animate-pulse uppercase tracking-widest text-xs">
          Preparando Preguntas...
        </p>
      </div>
    );
  }

  // 2. Pantalla de Cuenta Regresiva
  if (gameState === "starting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black overflow-hidden">
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          exit={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <span className="text-8xl md:text-9xl font-black text-emerald-500 italic">
            {countdown > 0 ? countdown : "¡YA!"}
          </span>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-8"
          >
            Prepárate
          </motion.p>
        </motion.div>

        <div className="absolute inset-0 z-[-1] flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-64 h-64 border-2 border-emerald-500 rounded-full absolute"
          />
        </div>
      </div>
    );
  }

  // 3. Pantalla de Resultados
  if (gameState === "finished") {
    return (
      <ResultsView
        points={points}
        accuracy={score}
        totalQuestions={questions.length}
        earnedCredits={score * 2}
        onReset={handleReset}
      />
    );
  }

  // 4. Pantalla de Juego
  return (
    <div className="max-w-2xl mx-auto p-4 md:pt-10 pt-2">
      {/* HUD Superior: Categoría y Dificultad */}
      <div className="flex justify-between items-center mb-2 md:mb-6">
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 px-3 py-1.5 rounded-full shadow-sm">
          <span className="text-xl">{activeCategory?.icon || "🎮"}</span>
          <span className="text-xs font-black uppercase tracking-tight dark:text-gray-300">
            {activeCategory?.name || "Cargando..."}
          </span>
        </div>

        <div
          className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 
        ${
          currentQ.difficulty === "Fácil"
            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
            : currentQ.difficulty === "Medio"
            ? "bg-amber-50 border-amber-200 text-amber-600"
            : "bg-red-50 border-red-200 text-red-600 animate-pulse"
        }`}
        >
          Nivel {currentQ.difficulty}
        </div>
      </div>

      {/* HUD Secundario: Barra de tiempo y progreso */}
      <div className="flex flex-col gap-4 mb-3 md:mb-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
              Pregunta {currentIndex + 1} / {questions.length}
            </span>
            <h2 className="text-gray-400 font-bold text-sm leading-none">
              {activeCategory?.description}
            </h2>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black transition-colors
          ${
            timeLeft < 4
              ? "bg-red-500 text-white animate-bounce"
              : "bg-gray-100 dark:bg-neutral-900 dark:text-white border-b-4 border-gray-200 dark:border-neutral-800"
          }`}
          >
            <TimerIcon
              size={18}
              className={timeLeft < 4 ? "animate-spin" : ""}
            />
            {timeLeft}s
          </div>
        </div>

        <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
            className="h-full bg-emerald-500"
          />
        </div>
      </div>

      {/* HUD de Puntos y Racha */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-2xl">
          <span className="text-[10px] font-black uppercase opacity-60 block">
            Puntos
          </span>
          <motion.span
            key={points}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xl font-black"
          >
            {points.toLocaleString()}
          </motion.span>
        </div>

        <AnimatePresence>
          {streak > 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-2xl shadow-lg shadow-amber-500/20"
            >
              <Zap size={16} fill="white" />
              <span className="font-black italic">COMBO X{streak}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animación de puntos flotantes */}
      <AnimatePresence>
        {selectedOption !== null && isCorrect && (
          <div className="absolute right-10 top-1/2 z-50 flex flex-col items-end">
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -50 }}
              exit={{ opacity: 0 }}
              className="text-emerald-500 font-black text-3xl"
            >
              +{lastPointsEarned}
            </motion.div>

            {showBoost && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-tighter"
              >
                🚀 Boost {profile?.carrera} +20%
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Pregunta */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="min-h-[300px]"
        >
          <div className="bg-white dark:bg-neutral-900 p-3 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-xl shadow-gray-200/50 dark:shadow-none mb-6 relative overflow-hidden">
            <span className="absolute -bottom-4 -right-2 text-8xl font-black opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
              {currentQ.difficulty}
            </span>

            <h3 className="text-xl md:text-2xl font-bold dark:text-white text-center leading-tight relative z-10">
              {currentQ.question_text}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 dark:text-white">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correct_option_index;
              const showResult = selectedOption !== null;

              return (
                <button
                  key={idx}
                  disabled={showResult}
                  onClick={() => handleAnswer(idx)}
                  className={`p-3 md:p-5 rounded-2xl border-2 font-bold text-sm transition-all duration-200 flex items-center justify-between
          ${
            !showResult
              ? "bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 hover:border-emerald-500 active:scale-95 text-gray-700 dark:text-gray-200"
              : ""
          }
          ${
            showResult && isSelected && isCorrect
              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : ""
          }
          ${
            showResult && isSelected && !isCorrect
              ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30"
              : ""
          }
          ${
            showResult && !isSelected
              ? "opacity-40 border-gray-100 dark:border-neutral-800 dark:text-gray-500"
              : ""
          }
        `}
                >
                  {option}
                  {showResult && isSelected && isCorrect && (
                    <Zap size={16} fill="white" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback de tiempo agotado */}
      {selectedOption === -1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-red-500 font-black uppercase text-xs">
          <AlertCircle size={16} /> ¡Se acabó el tiempo!
        </div>
      )}
    </div>
  );
};

export default TriviaGame;