import { useState, useEffect } from "react";

export const useCountdown = ( gameState) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (gameState === "starting") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        onComplete();
      }
    }
  }, [countdown, gameState]);

  const startCountdown = () => {
    setCountdown(3);
  };

  const resetCountdown = () => {
    setCountdown(3);
  };

  return {
    countdown,
    startCountdown,
    resetCountdown,
    setCountdown
  };
};