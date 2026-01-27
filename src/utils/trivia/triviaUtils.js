// Configuración de dificultad
export const DIFFICULTY_SETTINGS = {
  Fácil: { time: 15, basePoints: 100, multiplier: 1 },
  Medio: { time: 10, basePoints: 150, multiplier: 1.5 },
  Difícil: { time: 5, basePoints: 200, multiplier: 2 },
};

// Función para mezclar un array (Algoritmo Fisher-Yates)
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Calcular puntos de una respuesta
export const calculatePoints = (
  question,
  timeLeft,
  streak,
  profile
) => {
  const diffSetting = DIFFICULTY_SETTINGS[question.difficulty || "Fácil"];
  
  // Cálculo Base con Dificultad
  const timeBonus = timeLeft * 20 * diffSetting.multiplier;
  const currentStreakBonus = Math.min(streak * 20, 100);
  let roundPoints = Math.floor(
    diffSetting.basePoints + timeBonus + currentStreakBonus
  );

  // Aplicación del Boost de Carrera (Bonus del 20%)
  const isCarreraMatch =
    question.carrera_restriccion &&
    profile?.carrera === question.carrera_restriccion;

  if (isCarreraMatch) {
    roundPoints = Math.floor(roundPoints * 1.2);
  }

  return {
    points: roundPoints,
    hasBoost: isCarreraMatch,
  };
};