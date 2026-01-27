import { useState, useEffect } from "react";

export const useCountdown = (initialCount, onComplete) => {
  const [countdown, setCountdown] = useState(initialCount);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        onComplete();
      }
    }
  }, [countdown, isActive, onComplete]);

  const startCountdown = () => {
    setCountdown(initialCount);
    setIsActive(true);
  };

  const resetCountdown = () => {
    setCountdown(initialCount);
    setIsActive(false);
  };

  return {
    countdown,
    isActive,
    startCountdown,
    resetCountdown,
  };
};