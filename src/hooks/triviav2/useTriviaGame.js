import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";

// Constantes de dificultad
const DIFFICULTY_SETTINGS = {
  Fácil: { time: 15, basePoints: 100, multiplier: 1 },
  Medio: { time: 10, basePoints: 150, multiplier: 1.5 },
  Difícil: { time: 5, basePoints: 200, multiplier: 2 },
};

const INITIAL_COUNTDOWN = 3;
const QUESTIONS_PER_GAME = 10;
const ANSWER_FEEDBACK_DELAY = 1500;
const STREAK_BONUS_MULTIPLIER = 20;
const MAX_STREAK_BONUS = 100;
const CARRERA_BOOST_MULTIPLIER = 1.2;

/**
 * Hook personalizado para manejar toda la lógica del juego Trivia
 * @param {Object} profile - Perfil del usuario actual
 * @returns {Object} Estado del juego y funciones de control
 */
export const useTriviaGame = (profile) => {
  // Estados principales del juego
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("loading");
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const [showBoost, setShowBoost] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);

  // Refs para limpiar timers
  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  /**
   * Obtiene una pregunta aleatoria y sus preguntas asociadas
   */
  const fetchQuestions = useCallback(async () => {
    try {
      const { data: categories } = await supabaseClient
        .from("trivia_categories")
        .select("*");

      if (!categories || categories.length === 0) {
        throw new Error("No categories available");
      }

      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      setActiveCategory(randomCat);

      const { data: qs, error } = await supabaseClient.rpc(
        "get_random_questions",
        {
          p_category_id: randomCat.id,
          p_limit: QUESTIONS_PER_GAME,
        }
      );

      if (error) throw error;

      if (qs && qs.length > 0) {
        const shuffledQuestions = qs.map((q) => ({
          ...q,
          ...shuffleOptions(q),
        }));

        setQuestions(shuffledQuestions);
        setGameState("starting");
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      notify.error("No se pudieron cargar las preguntas");
      setGameState("error");
    }
  }, []);

  /**
   * Mezcla las opciones de una pregunta (Fisher-Yates)
   */
  const shuffleOptions = useCallback((question) => {
    const correctText = question.options[question.correct_option_index];
    const newOptions = [...question.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = newOptions.indexOf(correctText);

    return {
      options: newOptions,
      correct_option_index: newCorrectIndex,
    };
  }, []);

  /**
   * Calcula los puntos ganados en la respuesta
   */
  const calculatePoints = useCallback(
    (correct, timeLeftValue, difficulty, currentStreak) => {
      if (!correct) return 0;

      const diffSetting = DIFFICULTY_SETTINGS[difficulty || "Fácil"];
      const timeBonus = timeLeftValue * 20 * diffSetting.multiplier;
      const streakBonus = Math.min(currentStreak * STREAK_BONUS_MULTIPLIER, MAX_STREAK_BONUS);

      let roundPoints = Math.floor(
        diffSetting.basePoints + timeBonus + streakBonus
      );

      // Aplicar boost de carrera si aplica
      const isCarreraMatch =
        questions[currentIndex]?.carrera_restriccion &&
        profile?.carrera === questions[currentIndex].carrera_restriccion;

      if (isCarreraMatch) {
        roundPoints = Math.floor(roundPoints * CARRERA_BOOST_MULTIPLIER);
        setShowBoost(true);
      }

      return roundPoints;
    },
    [questions, currentIndex, profile?.carrera]
  );

  /**
   * Maneja la respuesta del usuario
   */
  const handleAnswer = useCallback(
    (selectedIndex) => {
      if (selectedOption !== null) return;

      clearTimeout(timerRef.current);

      setSelectedOption(selectedIndex);
      const currentQuestion = questions[currentIndex];
      const correct = selectedIndex === currentQuestion.correct_option_index;

      if (correct) {
        setIsCorrect(true);
        const roundPoints = calculatePoints(
          true,
          timeLeft,
          currentQuestion.difficulty || "Fácil",
          streak
        );

        const timeUsedInThisRound =
          DIFFICULTY_SETTINGS[currentQuestion.difficulty || "Fácil"].time - timeLeft;

        setPoints((prev) => prev + roundPoints);
        setScore((prev) => prev + 1);
        setStreak((prev) => prev + 1);
        setLastPointsEarned(roundPoints);
        setTotalTimeUsed((prev) => prev + timeUsedInThisRound);
      } else {
        setIsCorrect(false);
        setStreak(0);
        setLastPointsEarned(0);

        const diffSetting =
          DIFFICULTY_SETTINGS[currentQuestion.difficulty || "Fácil"];
        const timeUsedInThisRound = diffSetting.time - timeLeft;
        setTotalTimeUsed((prev) => prev + timeUsedInThisRound);
      }

      // Mostrar feedback y pasar a siguiente pregunta
      feedbackTimerRef.current = setTimeout(() => {
        setShowBoost(false);
        moveToNextQuestion(currentIndex, questions.length, correct);
      }, ANSWER_FEEDBACK_DELAY);
    },
    [selectedOption, questions, currentIndex, timeLeft, streak, calculatePoints]
  );

  /**
   * Mueve a la siguiente pregunta o finaliza el juego
   */
  const moveToNextQuestion = useCallback(
    (currentIdx, totalQuestions, wasCorrect) => {
      if (currentIdx < totalQuestions - 1) {
        const nextQuestion = questions[currentIdx + 1];
        const nextDiff =
          DIFFICULTY_SETTINGS[nextQuestion.difficulty || "Fácil"];

        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsCorrect(false);
        setTimeLeft(nextDiff.time);
      } else {
        finishGame(wasCorrect);
      }
    },
    [questions]
  );

  /**
   * Finaliza el juego y guarda los resultados
   */
  const finishGame = useCallback((wasCorrect) => {
    const finalScore = score + (wasCorrect ? 1 : 0);
    setGameState("finished");
    saveGameResults(points, finalScore, totalTimeUsed);
  }, [score, points, totalTimeUsed]);

  /**
   * Guarda los resultados en la base de datos
   */
  const saveGameResults = useCallback(
    async (finalPoints, finalScore, finalTime) => {
      try {
        const { data,error } = await supabaseClient.rpc("submit_trivia_score", {
          p_points: finalPoints,
          p_accuracy: finalScore,
          p_time_seconds: finalTime,
        });

        console.log(data)
        if (error) {
          console.error("Error saving results:", error);
          notify.error("Error al guardar los resultados");
        }
      } catch (error) {
        console.error("Error in saveGameResults:", error);
      }
    },
    []
  );

  /**
   * Reinicia el juego
   */
  const handleReset = useCallback(() => {
    setPoints(0);
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(false);
    setTotalTimeUsed(0);
    setCountdown(INITIAL_COUNTDOWN);
    setGameState("loading");
    setShowBoost(false);
    setLastPointsEarned(0);

    fetchQuestions();
  }, [fetchQuestions]);

  // ========== EFECTOS ==========

  /**
   * Inicializa el juego al montar el componente
   */
  useEffect(() => {
    fetchQuestions();

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(feedbackTimerRef.current);
    };
  }, [fetchQuestions]);

  /**
   * Ajusta el tiempo al cambiar de pregunta
   */
  useEffect(() => {
    if (questions.length > 0 && currentIndex === 0) {
      const diff = questions[0].difficulty || "Fácil";
      setTimeLeft(DIFFICULTY_SETTINGS[diff].time);
    }
  }, [questions]);

  /**
   * Maneja la cuenta regresiva inicial
   */
  useEffect(() => {
    if (gameState === "starting") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState("playing");
      }
    }
  }, [gameState, countdown]);

  /**
   * Lógica del temporizador
   */
  useEffect(() => {
    if (gameState === "playing" && selectedOption === null) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(
          () => setTimeLeft((prev) => prev - 1),
          1000
        );
      } else {
        // Se acabó el tiempo
        handleAnswer(-1);
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState, selectedOption, handleAnswer]);

  // ========== MEMOIZACIONES ==========

  const currentQuestion = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex]
  );

  const currentDifficulty = useMemo(
    () => currentQuestion?.difficulty || "Fácil",
    [currentQuestion]
  );

  const gameProgress = useMemo(
    () => ({
      current: currentIndex + 1,
      total: questions.length,
      percentage: ((currentIndex + 1) / questions.length) * 100,
    }),
    [currentIndex, questions.length]
  );

  return {
    // Estados
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
    totalTimeUsed,
    showBoost,
    activeCategory,
    countdown,
    currentDifficulty,
    gameProgress,
    // Funciones
    handleAnswer,
    handleReset,
  };
};

export default useTriviaGame;
