/**
 * GUÍA DE USO - Hook useTriviaGame
 * 
 * Este archivo muestra ejemplos de cómo usar el hook personalizado
 * en diferentes contextos y escenarios.
 */

// ============================================
// 1. USO BÁSICO EN TriviaGamev3
// ============================================

import { useTriviaGame } from "../../hooks/triviav2/useTriviaGame";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../context/AuthContext";

function TriviaGamev3() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  // Obtener toda la lógica del hook
  const {
    questions,
    currentIndex,
    currentQuestion,
    score,
    gameState,
    points,
    handleAnswer,
    handleReset,
  } = useTriviaGame(profile);

  return (
    <div>
      {/* Tu JSX aquí */}
    </div>
  );
}

// ============================================
// 2. USO CON COMPONENTES CUSTOMIZADOS
// ============================================

import { useCallback, memo } from "react";

// Componente que solo muestra el score
const ScoreWidget = memo(({ points, score }) => {
  return <div>Puntos: {points} | Aciertos: {score}</div>;
});

// Componente que maneja respuestas
const QuestionComponent = memo(({ question, onAnswer, isAnswered }) => {
  const handleClick = useCallback(
    (index) => {
      onAnswer(index);
    },
    [onAnswer]
  );

  return (
    <div>
      <h3>{question.question_text}</h3>
      {question.options.map((option, idx) => (
        <button key={idx} onClick={() => handleClick(idx)} disabled={isAnswered}>
          {option}
        </button>
      ))}
    </div>
  );
});

// Usando en el componente principal
function MyTriviaGame() {
  const { currentQuestion, handleAnswer, points, score } =
    useTriviaGame(profile);

  return (
    <>
      <ScoreWidget points={points} score={score} />
      <QuestionComponent
        question={currentQuestion}
        onAnswer={handleAnswer}
        isAnswered={selectedOption !== null}
      />
    </>
  );
}

// ============================================
// 3. USO CON ESTADO LOCAL ADICIONAL
// ============================================

import { useState } from "react";

function AdvancedTriviaGame() {
  const { currentQuestion, handleAnswer, gameState } = useTriviaGame(profile);
  const [showHint, setShowHint] = useState(false);

  const handleHintClick = useCallback(() => {
    setShowHint((prev) => !prev);
  }, []);

  return (
    <div>
      {showHint && <div>Pista: {currentQuestion?.hint}</div>}
      <button onClick={handleHintClick}>Mostrar pista</button>
      {/* resto del juego */}
    </div>
  );
}

// ============================================
// 4. USO CON EFECTOS PERSONALIZADOS
// ============================================

import { useEffect } from "react";
import { toast } from "sonner";

function TriviaWithNotifications() {
  const { gameState, score, streak } = useTriviaGame(profile);

  // Notificar cuando se completa una pregunta
  useEffect(() => {
    if (score > 0) {
      toast.success(`¡Pregunta correcta! Score: ${score}`);
    }
  }, [score]);

  // Notificar cuando hay una racha importante
  useEffect(() => {
    if (streak > 5) {
      toast("🔥 ¡Increíble racha!", { description: `${streak} aciertos seguidos` });
    }
  }, [streak]);

  return null; // El toast se mostrará automáticamente
}

// ============================================
// 5. USO CON CONTEXTO GLOBAL
// ============================================

import { createContext, useContext } from "react";

const TriviaContext = createContext();

function TriviaProvider({ children }) {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const triviaGame = useTriviaGame(profile);

  return (
    <TriviaContext.Provider value={triviaGame}>
      {children}
    </TriviaContext.Provider>
  );
}

// Hook para usar el contexto
function useTriviaContext() {
  const context = useContext(TriviaContext);
  if (!context) {
    throw new Error("useTriviaContext must be used within TriviaProvider");
  }
  return context;
}

// Componentes que usan el contexto
function ScoreDisplay() {
  const { points } = useTriviaContext();
  return <div>Puntos: {points}</div>;
}

function QuestionDisplay() {
  const { currentQuestion, handleAnswer } = useTriviaContext();
  return (
    <div>
      {currentQuestion.options.map((opt, idx) => (
        <button key={idx} onClick={() => handleAnswer(idx)}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// Uso en App
function App() {
  return (
    <TriviaProvider>
      <ScoreDisplay />
      <QuestionDisplay />
    </TriviaProvider>
  );
}

// ============================================
// 6. TESTING DEL HOOK
// ============================================

import { renderHook, act } from "@testing-library/react";
import { waitFor } from "@testing-library/react";

describe("useTriviaGame", () => {
  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useTriviaGame(mockProfile));

    expect(result.current.gameState).toBe("loading");
  });

  it("should handle answer correctly", () => {
    const { result } = renderHook(() => useTriviaGame(mockProfile));

    act(() => {
      result.current.handleAnswer(0);
    });

    expect(result.current.selectedOption).toBe(0);
  });

  it("should reset game state", () => {
    const { result } = renderHook(() => useTriviaGame(mockProfile));

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.points).toBe(0);
    expect(result.current.score).toBe(0);
  });

  it("should calculate points correctly", async () => {
    const { result } = renderHook(() => useTriviaGame(mockProfile));

    await waitFor(() => {
      expect(result.current.questions.length).toBeGreaterThan(0);
    });

    const initialPoints = result.current.points;

    act(() => {
      result.current.handleAnswer(result.current.currentQuestion.correct_option_index);
    });

    await waitFor(() => {
      expect(result.current.points).toBeGreaterThan(initialPoints);
    });
  });
});

// ============================================
// 7. PATRONES AVANZADOS
// ============================================

// Usar múltiples instancias del hook (para múltiples juegos)
function MultipleGames() {
  const game1 = useTriviaGame(profile1);
  const game2 = useTriviaGame(profile2);

  return (
    <div>
      <div>Game 1: {game1.points}</div>
      <div>Game 2: {game2.points}</div>
    </div>
  );
}

// Usar con Reducers para lógica más compleja
function TriviaWithReducer() {
  const triviaGame = useTriviaGame(profile);
  const [gameOptions, dispatch] = useReducer(gameReducer, initialGameOptions);

  const handleAnswer = useCallback(
    (index) => {
      triviaGame.handleAnswer(index);
      dispatch({ type: "ANSWER_GIVEN", payload: index });
    },
    [triviaGame]
  );

  return null;
}

// ============================================
// 8. PERFORMANCE TIPS
// ============================================

/**
 * TIPS DE PERFORMANCE:
 * 
 * 1. MEMOIZACIÓN:
 *    - Usa memo() en componentes que reciben props del hook
 *    - Usa useCallback() para funciones pasadas como props
 *    - Usa useMemo() para datos derivados
 * 
 * 2. DEPENDENCIES:
 *    - Verifica que todos los effects tengan las dependencias correctas
 *    - Evita agregar objetos/arrays sin memoizar como dependencias
 * 
 * 3. RENDERING:
 *    - Divide en componentes pequeños
 *    - Memoiza componentes que se renderizan frecuentemente
 *    - Evita crear objetos nuevos en cada render
 * 
 * 4. STATE:
 *    - Coloca el estado lo más cerca posible de donde se usa
 *    - Considera usar Context para estado global
 *    - No duplicues estado que puede derivarse
 * 
 * 5. EFFECTS:
 *    - Limpia timers y listeners
 *    - Agrupa effects relacionados
 *    - Evita effects que se ejecutan en cada render
 */

export {
  useTriviaGame,
  TriviaProvider,
  useTriviaContext,
  MultipleGames,
  TriviaWithReducer,
};
