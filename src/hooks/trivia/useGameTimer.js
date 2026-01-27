import { useState, useEffect, useRef } from "react";

export const useGameTimer = (initialTime, gameState, selectedOption, onTimeUp) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef(null);
  const hasCalledTimeUp = useRef(false);

  useEffect(() => {
    setTimeLeft(initialTime);
    hasCalledTimeUp.current = false;
  }, [initialTime]);

  useEffect(() => {
    // Solo ejecutar si estamos en estado playing y hay una opción no seleccionada
    if (gameState === "playing" && selectedOption === null) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(
          () => setTimeLeft((prev) => prev - 1),
          1000
        );
      } else if (!hasCalledTimeUp.current) {
        hasCalledTimeUp.current = true;
        onTimeUp();
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, gameState, selectedOption, onTimeUp]);

  const clearTimer = () => {
    clearTimeout(timerRef.current);
  };

  return { timeLeft, setTimeLeft, clearTimer };
};