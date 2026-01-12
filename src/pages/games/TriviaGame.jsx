import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Timer as TimerIcon, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient";
import ResultsView from "../../components/games/ResultsView";
import { useProfile } from "../../hooks/useProfile";

const TriviaGame = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
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
  // Añade este estado para acumular el tiempo usado
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const [showBoost, setShowBoost] = useState(false); // Estado para feedback visual del boost
  const [activeCategory, setActiveCategory] = useState(null);
  const [countdown, setCountdown] = useState(3);

  // CONFIGURACIÓN DE DIFICULTAD
  const DIFFICULTY_SETTINGS = {
    Fácil: { time: 15, basePoints: 100, multiplier: 1 },
    Medio: { time: 10, basePoints: 150, multiplier: 1.5 },
    Difícil: { time: 5, basePoints: 200, multiplier: 2 },
  };

  useEffect(() => {
    initGame();
  }, []);

  // 1. Cargar Categoría Aleatoria y sus Preguntas

  const initGame = async () => {
    try {
      // Obtener todas las categorías disponibles
      const { data: categories } = await supabaseClient
        .from("trivia_categories")
        .select("*");

      if (categories && categories?.length > 0) {
        // Elegir una al azar
        const randomCat =
          categories[Math.floor(Math.random() * categories.length)];
        setActiveCategory(randomCat);

        // 2. Llamamos a la RPC pasándole el ID de la categoría sorteada
        const { data: qs, error } = await supabaseClient.rpc(
          "get_random_questions",
          {
            p_category_id: randomCat.id,
            p_limit: 10,
          }
        );

        if (error) throw error;

        if (qs && qs.length > 0) {
          const shuffledQuestions = qs.map((q) => {
            // 1. Identificamos el texto de la respuesta correcta antes de mezclar
            const correctText = q.options[q.correct_option_index];

            // 2. Mezclamos las opciones
            const newOptions = shuffleArray(q.options);

            // 3. Encontramos el nuevo índice donde quedó el texto correcto
            const newCorrectIndex = newOptions.indexOf(correctText);

            return {
              ...q,
              options: newOptions,
              correct_option_index: newCorrectIndex, // Sobrescribimos con el nuevo índice
            };
          });

          setQuestions(shuffledQuestions);
        }

        //setGameState("playing");
        setGameState("starting");
      }
    } catch (error) {
      toast.error("No se pudieron cargar las preguntas");
    }
  };

  // 1. Al cargar preguntas, el primer timer debe ajustarse a la primera pregunta
  useEffect(() => {
    if (questions.length > 0 && currentIndex === 0) {
      const diff = questions[0].difficulty || "Fácil";
      setTimeLeft(DIFFICULTY_SETTINGS[diff].time);
    }
  }, [questions]);

  // Efecto para la cuenta regresiva
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

  // Función para mezclar un array (Algoritmo Fisher-Yates)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleAnswer = (index) => {
    if (selectedOption !== null) return;
    clearTimeout(timerRef.current);

    setSelectedOption(index);
    const currentQuestion = questions[currentIndex];
    const diffSetting =
      DIFFICULTY_SETTINGS[currentQuestion.difficulty || "Fácil"];
    const correct = index === currentQuestion.correct_option_index;

    let roundPoints = 0;
    let timeUsedInThisRound = 0;

    if (correct) {
      setIsCorrect(true);

      // 1. Cálculo Base con Dificultad
      const timeBonus = timeLeft * 20 * diffSetting.multiplier;
      const currentStreakBonus = Math.min(streak * 20, 100);
      roundPoints = Math.floor(
        diffSetting.basePoints + timeBonus + currentStreakBonus
      );

      // 2. APLICACIÓN DEL BOOST DE CARRERA (Bonus del 20%)
      const isCarreraMatch =
        currentQuestion.carrera_restriccion &&
        profile?.carrera === currentQuestion.carrera_restriccion;

      if (isCarreraMatch) {
        roundPoints = Math.floor(roundPoints * 1.2);
        setShowBoost(true); // Activamos la notificación visual
      }

      timeUsedInThisRound = diffSetting.time - timeLeft;
      setTotalTimeUsed((prev) => prev + timeUsedInThisRound);

      setPoints((prev) => prev + roundPoints);
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setLastPointsEarned(roundPoints);
    } else {
      setIsCorrect(false);
      setStreak(0);
      setLastPointsEarned(0);
      timeUsedInThisRound = diffSetting.time - timeLeft;
      setTotalTimeUsed((prev) => prev + timeUsedInThisRound);
    }

    // Limpiar el boost y pasar a la siguiente pregunta
    setTimeout(() => {
      setShowBoost(false);
      if (currentIndex < questions.length - 1) {
        const nextQuestion = questions[currentIndex + 1];
        const nextDiff =
          DIFFICULTY_SETTINGS[nextQuestion.difficulty || "Fácil"];

        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsCorrect(false);
        setTimeLeft(nextDiff.time);
      } else {
        setGameState("finished");
        saveResults(
          points + roundPoints,
          score + (correct ? 1 : 0),
          totalTimeUsed + timeUsedInThisRound
        );
      }
    }, 1500);
  };

  const handleReset = () => {
    // Resetear estados de juego
    setPoints(0);
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(false);
    setTotalTimeUsed(0);
    setCountdown(3);
    setGameState("loading");

    // Volver al estado de carga para disparar el useEffect de initGame
    // O mejor aún: crear una función 'fetchQuestions' aparte para reutilizarla
    initGame();

    // Si moviste la lógica de initGame a una función externa, llámala aquí.
    // Si no, el useEffect [gameState] detectará el cambio y reiniciará.
  };

  const saveResults = async (finalPoints, finalScore, finalTime) => {
    const { data, error } = await supabaseClient.rpc("submit_trivia_score", {
      p_points: finalPoints, // El estado 'points' con el Time-Bonus
      p_accuracy: finalScore, // El estado 'score' con los aciertos (0-10)
      p_time_seconds: finalTime, // Opcional: tiempo total
    });

    if (error) console.error(error);
  };

  // 1. Pantalla de Carga Inicial (Fetching de datos)
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

  // 2. Pantalla de Cuenta Regresiva (3, 2, 1)
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

        {/* Círculos decorativos de fondo */}
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

  if (gameState === "finished") {
    return (
      <ResultsView
        points={points}
        accuracy={score}
        totalQuestions={questions.length}
        earnedCredits={score * 2} // Asegúrate que coincida con tu lógica de SQL
        onReset={handleReset}
      />
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-4 md:pt-10 pt-2" >{/* md:pt-10 */}
      {/* HUD Superior: Barra de tiempo y progreso */}
      {/* HUD Superior: Categoría y Dificultad */}
      <div className="flex justify-between items-center mb-2 md:mb-6 ">{/**mb-6  -(md:mb-6)*/}
        {/* Categoría Activa */}
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 px-3 py-1.5 rounded-full shadow-sm">
          <span className="text-xl">{activeCategory?.icon || "🎮"}</span>
          <span className="text-xs font-black uppercase tracking-tight dark:text-gray-300">
            {activeCategory?.name || "Cargando..."}
          </span>
        </div>

        {/* Chip de Dificultad */}
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
      <div className="flex flex-col gap-4 mb-3  md:mb-8">{/**mb-8  -(md:mb-8)*/}
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
              Pregunta {currentIndex + 1} / {questions.length}
            </span>
            <h2 className="text-gray-400 font-bold text-sm leading-none">
              {activeCategory?.description}
            </h2>
          </div>

          {/* Timer Visual Mejorado */}
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

        {/* Barra de Progreso */}
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

      {/* HUD de Puntos y Racha - Ponlo arriba de la pregunta */}
      <div className="flex justify-between items-center mb-4"> {/**mb-4 */}
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

            {/* Etiqueta de Boost de Carrera */}
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
          <div className="bg-white dark:bg-neutral-900 p-3 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-xl shadow-gray-200/50 dark:shadow-none mb-6 relative overflow-hidden">{/**p-8 */}
            {/* Marca de agua de dificultad al fondo */}
            <span className="absolute -bottom-4 -right-2 text-8xl font-black opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
              {currentQ.difficulty}
            </span>

            <h3 className="text-xl md:text-2xl font-bold dark:text-white text-center leading-tight relative z-10">
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
                  className={`p-3 md:p-5 rounded-2xl border-2 font-bold text-sm transition-all duration-200 flex items-center justify-between
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
