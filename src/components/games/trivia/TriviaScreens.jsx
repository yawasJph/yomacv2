import { memo } from "react";
import { motion } from "framer-motion";
import ResultsView from "../ResultsView";

/**
 * Pantalla de carga inicial
 */
export const LoadingScreen = memo(() => {
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
});

LoadingScreen.displayName = "LoadingScreen";

/**
 * Pantalla de cuenta regresiva
 */
export const CountdownScreen = memo(({ countdown }) => {
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
});

CountdownScreen.displayName = "CountdownScreen";

/**
 * Pantalla de resultados finales
 */
export const FinishedScreen = memo(({ points, score, totalQuestions, onReset }) => {
  return (
    <ResultsView
      points={points}
      accuracy={score}
      totalQuestions={totalQuestions}
      earnedCredits={score * 2}
      onReset={onReset}
    />
  );
});

FinishedScreen.displayName = "FinishedScreen";

/**
 * Pantalla de error
 */
export const ErrorScreen = memo(({ onRetry }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-black text-red-500 mb-2">¡Error!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Hubo un problema al cargar el juego
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 transition-colors"
        >
          Reintentar
        </motion.button>
      </div>
    </div>
  );
});

ErrorScreen.displayName = "ErrorScreen";
