import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { TimerIcon, Zap } from "lucide-react";

/**
 * Componente para mostrar la barra superior con categoría y dificultad
 */
export const GameHeader = memo(({ activeCategory, difficulty }) => {
  const difficultyStyles = useMemo(() => {
    const styles = {
      Fácil: "bg-emerald-50 border-emerald-200 text-emerald-600",
      Medio: "bg-amber-50 border-amber-200 text-amber-600",
      Difícil: "bg-red-50 border-red-200 text-red-600 animate-pulse",
    };
    return styles[difficulty] || styles.Fácil;
  }, [difficulty]);

  return (
    <div className="flex justify-between items-center mb-2 md:mb-6">
      <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 px-3 py-1.5 rounded-full shadow-sm">
        <span className="text-xl">{activeCategory?.icon || "🎮"}</span>
        <span className="text-xs font-black uppercase tracking-tight dark:text-gray-300">
          {activeCategory?.name || "Cargando..."}
        </span>
      </div>

      <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 ${difficultyStyles}`}>
        Nivel {difficulty}
      </div>
    </div>
  );
});

GameHeader.displayName = "GameHeader";

/**
 * Componente para mostrar el progreso y el temporizador
 */
export const GameProgressBar = memo(({ currentIndex, totalQuestions, timeLeft, categoryDescription }) => {
  const timeColor = timeLeft < 4 ? "text-white" : "dark:text-white";
  const timeBgColor = timeLeft < 4 ? "bg-red-500 animate-bounce" : "bg-gray-100 dark:bg-neutral-900 dark:text-white border-b-4 border-gray-200 dark:border-neutral-800";
  const isTimeRunningOut = timeLeft < 4;

  return (
    <div className="flex flex-col gap-4 mb-3 md:mb-8">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
            Pregunta {currentIndex + 1} / {totalQuestions}
          </span>
          <h2 className="text-gray-400 font-bold text-sm leading-none">
            {categoryDescription}
          </h2>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black transition-colors ${timeBgColor} ${timeColor}`}>
          <TimerIcon
            size={18}
            className={isTimeRunningOut ? "animate-spin" : ""}
          />
          {timeLeft}s
        </div>
      </div>

      <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          className="h-full bg-emerald-500"
        />
      </div>
    </div>
  );
});

GameProgressBar.displayName = "GameProgressBar";

/**
 * Componente para mostrar puntos y racha
 */
export const ScoreDisplay = memo(({ points, streak }) => {
  return (
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
    </div>
  );
});

ScoreDisplay.displayName = "ScoreDisplay";

/**
 * Componente para mostrar la pregunta
 */
export const QuestionCard = memo(({ question, difficulty }) => {
  return (
    <div className="bg-white dark:bg-neutral-900 p-3 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-xl shadow-gray-200/50 dark:shadow-none mb-6 relative overflow-hidden">
      <span className="absolute -bottom-4 -right-2 text-8xl font-black opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
        {difficulty}
      </span>

      <h3 className="text-xl md:text-2xl font-bold dark:text-white text-center leading-tight relative z-10">
        {question?.question_text}
      </h3>
    </div>
  );
});

QuestionCard.displayName = "QuestionCard";

/**
 * Componente para mostrar las opciones de respuesta
 */
export const AnswerOptions = memo(({ options, selectedOption, correctOptionIndex, onSelect, disabled }) => {
  const getButtonStyles = (index) => {
    const isSelected = selectedOption === index;
    const isCorrectOption = index === correctOptionIndex;
    const showResult = selectedOption !== null;

    let baseStyles = "p-3 md:p-5 rounded-2xl border-2 font-bold text-sm transition-all duration-200 flex items-center justify-between";

    if (!showResult) {
      return `${baseStyles} bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 hover:border-emerald-500 active:scale-95 text-gray-700 dark:text-gray-200`;
    }

    if (isSelected && isCorrectOption) {
      return `${baseStyles} bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30`;
    }

    if (isSelected && !isCorrectOption) {
      return `${baseStyles} bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30`;
    }

    return `${baseStyles} opacity-40 border-gray-100 dark:border-neutral-800 dark:text-gray-500`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 dark:text-white">
      {options?.map((option, idx) => {
        const isSelected = selectedOption === idx;
        const isCorrectOption = idx === correctOptionIndex;
        const showResult = selectedOption !== null;

        return (
          <motion.button
            key={idx}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            disabled={disabled}
            onClick={() => onSelect(idx)}
            className={getButtonStyles(idx)}
          >
            {option}
            {showResult && isSelected && isCorrectOption && (
              <Zap size={16} fill="white" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
});

AnswerOptions.displayName = "AnswerOptions";

/**
 * Componente para mostrar animación de puntos flotantes
 */
export const FloatingPoints = memo(({ points, showBoost, userCarrera }) => {
  return (
    <div className="absolute right-10 top-1/2 z-50 flex flex-col items-end">
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: -50 }}
        exit={{ opacity: 0 }}
        className="text-emerald-500 font-black text-3xl"
      >
        +{points}
      </motion.div>

      {showBoost && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-tighter"
        >
          🚀 Boost {userCarrera} +20%
        </motion.div>
      )}
    </div>
  );
});

FloatingPoints.displayName = "FloatingPoints";
