import { memo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { useTriviaGame } from "../../hooks/triviav2/useTriviaGame";
import {
  GameHeader,
  GameProgressBar,
  ScoreDisplay,
  QuestionCard,
  AnswerOptions,
  FloatingPoints,
} from "../../components/games/trivia/TriviaComponents";
import {
  LoadingScreen,
  CountdownScreen,
  FinishedScreen,
  ErrorScreen,
} from "../../components/games/trivia/TriviaScreens";


/**
 * Componente principal del juego Trivia
 * Separado de la lógica mediante el hook useTriviaGame
 */
const TriviaGamev3 = memo(() => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const {
    questions,
    currentIndex,
    currentQuestion,
    score,
    gameState,
    selectedOption,
    timeLeft,
    points,
    streak,
    lastPointsEarned,
    isCorrect,
    showBoost,
    activeCategory,
    countdown,
    currentDifficulty,
    gameProgress,
    handleAnswer,
    handleReset,
  } = useTriviaGame(profile);

  /**
   * Callback memoizado para manejar respuestas
   */
  const onSelectAnswer = useCallback(
    (index) => {
      handleAnswer(index);
    },
    [handleAnswer]
  );

  /**
   * Callback memoizado para reiniciar
   */
  const onResetGame = useCallback(() => {
    handleReset();
  }, [handleReset]);

  // Pantalla de carga
  if (gameState === "loading") {
    return <LoadingScreen />;
  }

  // Pantalla de error
  if (gameState === "error") {
    return <ErrorScreen onRetry={onResetGame} />;
  }

  // Pantalla de cuenta regresiva
  if (gameState === "starting") {
    return <CountdownScreen countdown={countdown} />;
  }

  // Pantalla de resultados finales
  if (gameState === "finished") {
    return (
      <FinishedScreen
        points={points}
        score={score}
        totalQuestions={questions.length}
        onReset={onResetGame}
      />
    );
  }

  // Pantalla principal del juego
  if (gameState === "playing" && currentQuestion) {
    const isAnswered = selectedOption !== null;

    return (
      <div className="max-w-2xl mx-auto p-4 md:pt-10 pt-2">
        {/* Encabezado */}
        <GameHeader
          activeCategory={activeCategory}
          difficulty={currentDifficulty}
        />

        {/* Barra de progreso */}
        <GameProgressBar
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          timeLeft={timeLeft}
          categoryDescription={activeCategory?.description}
        />

        {/* Puntos y racha */}
        <ScoreDisplay points={points} streak={streak} />

        {/* Animación de puntos flotantes */}
        <AnimatePresence>
          {isAnswered && isCorrect && (
            <FloatingPoints
              points={lastPointsEarned}
              showBoost={showBoost}
              userCarrera={profile?.carrera}
            />
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
            <QuestionCard
              question={currentQuestion}
              difficulty={currentDifficulty}
            />

            {/* Opciones de respuesta */}
            <AnswerOptions
              options={currentQuestion?.options}
              selectedOption={selectedOption}
              correctOptionIndex={currentQuestion?.correct_option_index}
              onSelect={onSelectAnswer}
              disabled={isAnswered}
            />
          </motion.div>
        </AnimatePresence>

        {/* Feedback de tiempo agotado */}
        {selectedOption === -1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-2 text-red-500 font-black uppercase text-xs"
          >
            <AlertCircle size={16} /> ¡Se acabó el tiempo!
          </motion.div>
        )}
      </div>
    );
  }

  // Fallback (nunca debería llegar aquí)
  return null;
});

export default TriviaGamev3
TriviaGamev3.displayName = "TriviaGamev3";
