import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import useSound from "use-sound";
import { supabaseClient } from "../../supabase/supabaseClient";
import { prepararTablero } from "../../components/games/utils/memoryHelpers";

export const useMemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [selectedBaraja, setSelectedBaraja] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Sonidos
  const [playFip] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playMatched] = useSound("/sounds/matched.mp3", { volume: 0.5 });
  const [playError] = useSound("/sounds/lose.mp3", { volume: 0.3 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.5 });

  const handlePlay = useCallback((soundFn) => {
    if (!isMuted) soundFn();
  }, [isMuted]);

  const resetGame = useCallback(() => {
    
    const { cartasListas, barajaElegida } = prepararTablero();

    setSelectedBaraja(barajaElegida);
    setCards(cartasListas);
    setFlippedCards([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setIsActive(false);
    setShowVictory(false);
  }, [prepararTablero]);

  const saveGameResult = async (score, steps, time) => {
    try {
      await supabaseClient.rpc("submit_game_score", {
        p_game_id: "memory",
        p_score: score,
        p_moves: steps,
        p_time_seconds: time,
      });
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // Cronómetro
  useEffect(() => {
    let interval = null;
    if (isActive && matched.length < cards.length) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, matched.length, cards.length]);

  const handleFlip = useCallback((index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matched.includes(index)) return;

    handlePlay(playFip);
    if (!isActive) setIsActive(true);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].type === cards[second].type) {
        setMatched((prev) => [...prev, first, second]);
        setTimeout(() => handlePlay(playMatched), 200);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          handlePlay(playError);
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, matched, cards, isActive, handlePlay, playFip, playMatched, playError]);

  // Efecto de Victoria
  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      setIsActive(false);
      handlePlay(playWin);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

      const score = Math.max(0, 1000 - moves * 10 - seconds * 2);
      setFinalScore(score);
      saveGameResult(score, moves, seconds);
      setTimeout(() => setShowVictory(true), 1000);
    }
  }, [matched.length, cards.length, handlePlay, playWin, moves, seconds]);

  return {
    cards, flippedCards, matched, moves, seconds, showVictory, 
    finalScore, selectedBaraja, isMuted, setIsMuted, 
    handleFlip, resetGame
  };
};