import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import { Timer as TimerIcon, Trophy, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient";
import ResultsView from "../../components/games/ResultsView";

const TriviaGame = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("loading"); // loading, playing, finished
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15); // 15 segundos por pregunta
  const timerRef = useRef(null);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastPointsEarned, setLastPointsEarned] = useState(0); // Para la animación de "+150"
  const [isCorrect, setIsCorrect] = useState(false);

  // 1. Cargar Categoría Aleatoria y sus Preguntas
  useEffect(() => {
    const initGame = async () => {
      try {
        // Obtener todas las categorías disponibles
        const { data: categories } = await supabaseClient
          .from("trivia_categories")
          .select("*");

        if (categories && categories.length > 0) {
          // Elegir una al azar
          const randomCat =
            categories[Math.floor(Math.random() * categories.length)];

          const { data: qs, error } = await supabaseClient
            .from("trivia_questions")
            .select("*")
            .eq("category_id", randomCat.id)
            .limit(10);

          if (error) throw error;

          setQuestions(qs.sort(() => Math.random() - 0.5));
          setGameState("playing");
        }
      } catch (error) {
        toast.error("No se pudieron cargar las preguntas");
      }
    };
    initGame();
  }, []);

  // 2. Lógica del Temporizador
  useEffect(() => {
    if (gameState === "playing" && selectedOption === null) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(
          () => setTimeLeft((prev) => prev - 1),
          1000
        );
      } else {
        // Se acabó el tiempo
        handleAnswer(-1); // -1 indica que no respondió a tiempo
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState, selectedOption]);

//   const handleAnswer = (index) => {
//     if (selectedOption !== null) return;
//     clearTimeout(timerRef.current);

//     setSelectedOption(index);
//     const correct = index === questions[currentIndex].correct_option_index;

//     if (correct) {
//       setIsCorrect(true);
//       // CALCULO DE TIME BONUS + STREAK
//       const basePoints = 100;
//       const timeBonus = timeLeft * 10;
//       const currentStreakBonus = Math.min(streak * 20, 100); // Max +100 por racha

//       const totalForThisRound = basePoints + timeBonus + currentStreakBonus;

//       setPoints((prev) => prev + totalForThisRound);
//       setScore((prev) => prev + 1);
//       setStreak((prev) => prev + 1);
//       setLastPointsEarned(totalForThisRound);
//     } else {
//       setIsCorrect(false);
//       setStreak(0); // Se rompe la racha
//       setLastPointsEarned(0);
//     }

//     // Esperar y pasar a la siguiente
//     setTimeout(() => {
//       if (currentIndex < questions.length - 1) {
//         setCurrentIndex((prev) => prev + 1);
//         setSelectedOption(null);
//         setIsCorrect(false);
//         setTimeLeft(15); // Reiniciar timer
//       } else {
//         setGameState("finished");
//         //saveResults();
//         saveResults(points + roundPoints, score + (correct ? 1 : 0));
//       }
//     }, 1500);
//   };

    const handleAnswer = (index) => {
    if (selectedOption !== null) return;
    clearTimeout(timerRef.current);

    setSelectedOption(index);
    const correct = index === questions[currentIndex].correct_option_index;

    // Calculamos los valores de esta ronda
    let roundPoints = 0;
    let isCorrectRound = false;

    if (correct) {
      isCorrectRound = true;
      const basePoints = 100;
      const timeBonus = timeLeft * 10;
      const currentStreakBonus = Math.min(streak * 20, 100);
      roundPoints = basePoints + timeBonus + currentStreakBonus;

      setPoints((prev) => prev + roundPoints);
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setLastPointsEarned(roundPoints);
      setIsCorrect(true);
    } else {
      setStreak(0);
      setLastPointsEarned(0);
      setIsCorrect(false);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsCorrect(false);
        setTimeLeft(15);
      } else {
        setGameState("finished");
        // IMPORTANTE: Pasamos los valores calculados manualmente 
        // sumándolos al estado actual para no perder la última pregunta
        saveResults(points + roundPoints, score + (correct ? 1 : 0));
      }
    }, 1500);
  };

  const saveResults = async (finalPoints,finalScore) => {
    //const totalTimeUsed = (questions.length * 15) - totalTimeLeft;
    const { data, error } = await supabaseClient.rpc("submit_trivia_score", {
      p_points: finalPoints, // El estado 'points' con el Time-Bonus
      p_accuracy: finalScore, // El estado 'score' con los aciertos (0-10)
      p_time_seconds: 0, // Opcional: tiempo total
    });
    console.log("Enviado a Supabase:", finalPoints, finalScore);

    if (error) console.error(error);
  };

  if (gameState === "loading")
    return (
      <div className="p-10 text-center dark:text-white font-bold">
        Cargando desafío...
      </div>
    );

  if (gameState === "finished") {
    return (
      <ResultsView
        points={points}
        accuracy={score}
        totalQuestions={questions.length}
        earnedCredits={score * 5} // Asegúrate que coincida con tu lógica de SQL
      />
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-4 md:pt-10">
      {/* HUD Superior: Barra de tiempo y progreso */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
              Trivia Pro
            </span>
            <h2 className="text-gray-400 font-bold text-sm">
              Pregunta {currentIndex + 1} de {questions.length}
            </h2>
          </div>

          {/* Timer Visual */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black ${
              timeLeft < 5
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-100 dark:bg-neutral-900 dark:text-white"
            }`}
          >
            <TimerIcon size={18} />
            {timeLeft}s
          </div>
        </div>

        {/* Barra de Progreso de la Partida */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            animate={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
            className="h-full bg-emerald-500"
          />
        </div>
      </div>

      {/* HUD de Puntos y Racha - Ponlo arriba de la pregunta */}
      <div className="flex justify-between items-center mb-4">
        {/* Marcador de Puntos Totales */}
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

        {/* Contador de Racha (Solo se muestra si racha > 1) */}
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

      {/* Animación de puntos flotantes al acertar */}
      <AnimatePresence>
        {selectedOption !== null && isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -50 }}
            exit={{ opacity: 0 }}
            className="absolute right-10 top-1/2 text-emerald-500 font-black text-2xl z-50"
          >
            +{lastPointsEarned}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pregunta */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="min-h-[300px]"
        >
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm mb-6">
            <h3 className="text-xl md:text-2xl font-bold dark:text-white text-center leading-tight">
              {currentQ.question_text}
            </h3>
          </div>

          {/* Opciones */}
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
                  className={`p-5 rounded-2xl border-2 font-bold text-sm transition-all duration-200 flex items-center justify-between
                    ${
                      !showResult
                        ? "bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 hover:border-emerald-500 active:scale-95"
                        : ""
                    }
                    ${
                      showResult && isCorrect
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : ""
                    }
                    ${
                      showResult && isSelected && !isCorrect
                        ? "bg-red-500 border-red-500 text-white"
                        : ""
                    }
                    ${
                      showResult && !isCorrect && !isSelected
                        ? "opacity-40 border-gray-100 dark:border-neutral-800 dark:text-gray-500"
                        : ""
                    }
                  `}
                >
                  {option}
                  {showResult && isCorrect && <Zap size={16} fill="white" />}
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
