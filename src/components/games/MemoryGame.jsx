import React, { useState, useEffect } from "react";
import MemoryCard from "./MemoryCard";
import { Hash, RefreshCcw, Star, Timer } from "lucide-react";
import VictoryModal from "./VictoryModal";
import confetti from "canvas-confetti";
import { supabaseClient } from "../../supabase/supabaseClient";
import bajara1 from "../../assets/data-game/baraja1.json";
import bajara2 from "../../assets/data-game/baraja2.json";
import bajara3 from "../../assets/data-game/baraja3.json";
import bajara4 from "../../assets/data-game/baraja4.json";
import bajara5 from "../../assets/data-game/baraja5.json";
import bajara6 from "../../assets/data-game/baraja6.json";

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBaraja, setSelectedBaraja] = useState(null)

  const barajas = [bajara1, bajara4, bajara2, bajara3, bajara5, bajara6];
  
  const getRandomBaraja = () => {
    const randomIndex = Math.floor(Math.random() * barajas.length);
    setSelectedBaraja(barajas[randomIndex])
    return barajas[randomIndex].baraja;
  };

  const resetGame = () => {
    // Generar IDs únicos reales para cada carta duplicada
    const selectedBaraja = getRandomBaraja(); // 🎲 baraja aleatoria
    const duplicatedCards = [...selectedBaraja, ...selectedBaraja]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        ...card,
        id: `${card.type}-${index}-${Math.random()}`,
      }));

    setCards(duplicatedCards);
    setFlippedCards([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setIsActive(false);
    setShowVictory(false);
    setIsSaving(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  // Función para guardar en Supabase (RPC)
  const saveGameResult = async (score, steps, time) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const { data, error } = await supabaseClient.rpc("submit_game_score", {
        p_game_id: "memory",
        p_score: score,
        p_moves: steps,
        p_time_seconds: time,
      });

      if (error) throw error;
      console.log("Resultado guardado con éxito:", data);
    } catch (error) {
      console.error("Error al guardar el resultado:", error.message);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && matched.length < cards.length) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, matched, cards.length]);

  const handleFlip = (index) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(index) ||
      matched.includes(index)
    )
      return;

    if (!isActive) setIsActive(true);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].type === cards[second].type) {
        setMatched((prev) => [...prev, first, second]);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000); // Un segundo para memorizar
      }
    }
  };

  // Efecto de Victoria
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setIsActive(false); // Detener cronómetro

      // Disparar Confeti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
      });

      // Calcular score final para el modal
      const score = Math.max(0, 1000 - moves * 10 - seconds * 2);
      setFinalScore(score);

      saveGameResult(score, moves, seconds);

      // Mostrar modal con un pequeño delay
      setTimeout(() => setShowVictory(true), 1000);
    }
  }, [matched, cards.length]);

  console.log(selectedBaraja)
  return (
    
    <div className="max-w-2xl mx-auto p-4 select-none">
     
      {/* HUD de Juego */}
      <div className="grid grid-cols-3 gap-4 mb-3 sm:mb-8">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
          <Timer className="text-emerald-500 mb-1" size={18} />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Tiempo
          </span>
          <span className="text-lg font-black dark:text-white tabular-nums">
            {seconds}s
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
          <Hash className="text-blue-500 mb-1" size={18} />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Pasos
          </span>
          <span className="text-lg font-black dark:text-white tabular-nums">
            {moves}
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
          <Star className="text-yellow-500 mb-1" size={18} />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Puntos
          </span>
          <span className="text-lg font-black dark:text-white tabular-nums">
            {Math.max(0, 1000 - moves * 10 - seconds * 2)}
          </span>
        </div>
      </div>

      {/* Grid 4x4 */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            card={card}
            isFlipped={flippedCards.includes(index)}
            isMatched={matched.includes(index)}
            onClick={() => handleFlip(index)}
            isDisabled={matched.length === cards.length}
            cardType={selectedBaraja.type}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center sm:mt-8">
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-500 transition-all active:scale-95 shadow-sm"
        >
          <RefreshCcw size={18} /> Reiniciar Desafío
        </button>
      </div>

      <VictoryModal
        isOpen={showVictory}
        score={finalScore}
        time={seconds}
        moves={moves}
        onReset={resetGame}
      />
    </div>
  );
};

export default MemoryGame;
