import { useState, useEffect, useCallback } from "react";

import { useTriviaQuestions } from "./useTriviaQuestions";
import { useGameScore } from "./useGameScore";
import { useGameTimer } from "./useGameTimer";
import { DIFFICULTY_SETTINGS, calculatePoints } from "../../utils/trivia/triviaUtils";
import { supabaseClient } from "../../supabase/supabaseClient";

export const useTriviaGame = (profile) => {
  const { questions, activeCategory, isLoading, refetchQuestions } =
    useTriviaQuestions();
  const {
    score,
    points,
    streak,
    lastPointsEarned,
    totalTimeUsed,
    addCorrectAnswer,
    addIncorrectAnswer,
    resetScore,
  } = useGameScore();

  const [gameState, setGameState] = useState("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showBoost, setShowBoost] = useState(false);

  const currentQuestion = questions[currentIndex];
  const initialTime = currentQuestion
    ? DIFFICULTY_SETTINGS[currentQuestion.difficulty || "Fácil"].time
    : 15;

  const handleTimeUp = useCallback(() => {
    if (selectedOption === null && questions[currentIndex]) {
      handleAnswer(-1);
    }
  }, [selectedOption, currentIndex, questions]);

  const { timeLeft, setTimeLeft, clearTimer } = useGameTimer(
    initialTime,
    gameState,
    selectedOption,
    handleTimeUp
  );

  // Actualizar el tiempo cuando cambie la pregunta
  useEffect(() => {
    if (currentQuestion && gameState === "playing" && selectedOption === null) {
      const diffSetting =
        DIFFICULTY_SETTINGS[currentQuestion.difficulty || "Fácil"];
      setTimeLeft(diffSetting.time);
    }
  }, [currentIndex, gameState, selectedOption]);

  // Cambiar de loading a starting cuando las preguntas estén listas
  useEffect(() => {
    if (!isLoading && questions.length > 0 && gameState === "loading") {
      setGameState("starting");
    }
  }, [isLoading, questions, gameState]);

  const handleAnswer = useCallback((index) => {
    if (selectedOption !== null) return;
    
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return; // Validación crucial
    
    clearTimer();
    setSelectedOption(index);
    
    const diffSetting =
      DIFFICULTY_SETTINGS[currentQuestion.difficulty || "Fácil"];
    const correct = index === currentQuestion.correct_option_index;

    let roundPoints = 0;
    const timeUsedInThisRound = diffSetting.time - timeLeft;

    if (correct) {
      setIsCorrect(true);

      const result = calculatePoints(currentQuestion, timeLeft, streak, profile);
      roundPoints = result.points;

      if (result.hasBoost) {
        setShowBoost(true);
      }

      addCorrectAnswer(roundPoints, timeUsedInThisRound);
    } else {
      setIsCorrect(false);
      addIncorrectAnswer(timeUsedInThisRound);
    }

    // Pasar a la siguiente pregunta o finalizar
    setTimeout(() => {
      setShowBoost(false);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsCorrect(false);
      } else {
        setGameState("finished");
        saveResults(
          points + roundPoints,
          score + (correct ? 1 : 0),
          totalTimeUsed + timeUsedInThisRound
        );
      }
    }, 1500);
  }, [selectedOption, currentIndex, questions, timeLeft, streak, profile, points, score, totalTimeUsed, clearTimer, addCorrectAnswer, addIncorrectAnswer]);

  const saveResults = async (finalPoints, finalScore, finalTime) => {
    const { data, error } = await supabaseClient.rpc("submit_trivia_score", {
      p_points: finalPoints,
      p_accuracy: finalScore,
      p_time_seconds: finalTime,
    });

    if (error) console.error(error);
  };

  const handleReset = () => {
    resetScore();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(false);
    setShowBoost(false);
    setGameState("loading");
    refetchQuestions();
  };

  return {
    // Estado del juego
    gameState,
    setGameState,
    currentIndex,
    selectedOption,
    isCorrect,
    showBoost,

    // Datos
    questions,
    activeCategory,
    currentQuestion,

    // Puntuación
    score,
    points,
    streak,
    lastPointsEarned,

    // Timer
    timeLeft,

    // Acciones
    handleAnswer,
    handleReset,
  };
};