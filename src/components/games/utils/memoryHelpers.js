// src/utils/memoryHelpers.js
import barajas from "../../../assets/data-game/barajas.json";

/**
 * Selecciona una baraja al azar, la duplica, la mezcla y le asigna IDs únicos.
 */
export const prepararTablero = () => {
  const randomIndex = Math.floor(Math.random() * barajas.length);
  const barajaElegida = barajas[randomIndex];
  
  // Duplicamos y mezclamos
  const cartasListas = [...barajaElegida.baraja, ...barajaElegida.baraja]
    .sort(() => Math.random() - 0.5)
    .map((card, index) => ({
      ...card,
      id: `${card.type}-${index}-${Math.random()}`, // ID único para evitar errores de renderizado
    }));

  return { cartasListas, barajaElegida };
};

/**
 * Calcula el puntaje final basado en el progreso actual y bonos de eficiencia.
 */
export const calcularPuntajeFinal = (moves, seconds) => {
  const baseScore = 1000;
  const penalty = (moves * 10) + (seconds * 2);
  return Math.max(0, baseScore - penalty);
};