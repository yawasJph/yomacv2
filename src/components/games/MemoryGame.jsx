import { useState, useEffect, useCallback } from "react";
import MemoryCard from "./MemoryCard";
import VictoryModal from "./VictoryModal";
import confetti from "canvas-confetti";
import { supabaseClient } from "../../supabase/supabaseClient";
import HudSection from "./memory-game/HudSection";
import ActionButtons from "./memory-game/ActionButtons";
import barajas from "../../assets/data-game/barajas.json";
import useSound from "use-sound"; // 1. Importar la librería
import { useAudio } from "../../context/AudioContext";

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
  const [selectedBaraja, setSelectedBaraja] = useState(null);
  //const [isMuted, setIsMuted] = useState(false); // Estado del Mute
  const { playWithCheck} = useAudio()

  const [playFip] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playMatched] = useSound("/sounds/matched.mp3", { volume: 0.5 });
  const [playError] = useSound("/sounds/lose.mp3", { volume: 0.3 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.5 });

  const getRandomBaraja = () => {
    const randomIndex = Math.floor(Math.random() * barajas.length);
    setSelectedBaraja(barajas[randomIndex]);
    return barajas[randomIndex].baraja;
  };


  const resetGame = useCallback(() => {
    const barajaData = getRandomBaraja(); // Asumiendo que getRandomBaraja no depende de estado
    const duplicatedCards = [...barajaData, ...barajaData]
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
  }, []);

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
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const handleFlip = (index) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(index) ||
      matched.includes(index)
    )
      return;

    playWithCheck(playFip);

    if (!isActive) setIsActive(true);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].type === cards[second].type) {
        setMatched((prev) => [...prev, first, second]);
        setTimeout(() => playWithCheck(playMatched), 200);
        setFlippedCards([]);
      } else {
        // ✅ Sonido de error
        setTimeout(() => {
          playWithCheck(playError);
          setFlippedCards([]);
        }, 1000); // Un segundo para memorizar
      }
    }
  };

  // Efecto de Victoria
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setIsActive(false); // Detener cronómetro
      // Disparar Confeti

      playWithCheck(playWin);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
      }); 
      
      // Calcular score final para el modal
      const score = Math.max(0, 1000 - moves * 10 - seconds * 2);
      setFinalScore(score);

      saveGameResult(score, moves, seconds); // Mostrar modal con un pequeño delay

      setTimeout(() => setShowVictory(true), 1000);
    }
  }, [matched, cards.length]);

  return (
    <div className="relative max-w-2xl mx-auto p-4 select-none">
      
      {/* HUD de Juego */}
      <HudSection moves={moves} seconds={seconds} />

      {/* Grid 4x4 */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
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

      <ActionButtons resetGame={resetGame}  />

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
