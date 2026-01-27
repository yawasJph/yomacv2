import { useState } from "react";

export const useGameScore = () => {
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);

  const addCorrectAnswer = (earnedPoints, timeUsed) => {
    setScore((prev) => prev + 1);
    setPoints((prev) => prev + earnedPoints);
    setStreak((prev) => prev + 1);
    setLastPointsEarned(earnedPoints);
    setTotalTimeUsed((prev) => prev + timeUsed);
  };

  const addIncorrectAnswer = (timeUsed) => {
    setStreak(0);
    setLastPointsEarned(0);
    setTotalTimeUsed((prev) => prev + timeUsed);
  };

  const resetScore = () => {
    setScore(0);
    setPoints(0);
    setStreak(0);
    setLastPointsEarned(0);
    setTotalTimeUsed(0);
  };

  return {
    score,
    points,
    streak,
    lastPointsEarned,
    totalTimeUsed,
    addCorrectAnswer,
    addIncorrectAnswer,
    resetScore,
  };
};