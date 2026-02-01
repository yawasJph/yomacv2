import { useEffect } from "react";
import { useMemoryGame } from "../../hooks/memorama/useMemoryGame";
import HudSection from "./memory-game/HudSectionv2";
import MemoryCard from "./memory-game/MemoryCardv2";
import ActionButtons from "./memory-game/ActionButtonsv2";
import VictoryModal from "./memory-game/VictoryModalv4";

// Definimos los estilos fuera del componente para que no estorben
const STYLES = {
  container: "relative max-w-2xl mx-auto p-4 select-none min-h-screen",
  grid: "grid grid-cols-4 gap-2 sm:gap-4 mt-4",
};

const STYLES2 = {
  container: "relative max-w-2xl mx-auto p-4 select-none",
  grid: "grid grid-cols-4 gap-2 sm:gap-4",
};

const MemoryGame = () => {
  const {
    cards, flippedCards, matched, moves, seconds, showVictory,
    finalScore, selectedBaraja, isMuted, setIsMuted,
    handleFlip, resetGame
  } = useMemoryGame();

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  

  if (!selectedBaraja) return null;

  return (
    <div className={STYLES2.container}>
      <HudSection moves={moves} seconds={seconds} score={Math.max(0, 1000 - moves * 10 - seconds * 2)} />

      <div className={STYLES.grid}>
        {cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            card={card}
            isFlipped={flippedCards.includes(index)}
            isMatched={matched.includes(index)}
            onClick={() => handleFlip(index)}
            cardType={selectedBaraja.type}
          />
        ))}
      </div>

      <ActionButtons resetGame={resetGame} isMuted={isMuted} setIsMuted={setIsMuted} />

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