import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../../hooks/useProfile'; // Reutilizamos tu hook

const CARD_IMAGES = [
  { type: 'IAB', icon: '🌿' },
  { type: 'DSI', icon: '💻' },
  { type: 'ET', icon: '🩺' },
  // ... más iconos o fotos de perfil
];

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  // Inicializar juego
  useEffect(() => {
    const duplicatedCards = [...CARD_IMAGES, ...CARD_IMAGES]
      .map((card, index) => ({ ...card, id: index }))
      .sort(() => Math.random() - 0.5);
    setCards(duplicatedCards);
  }, []);

  const handleFlip = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matched.includes(index)) return;
    
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].type === cards[second].type) {
        setMatched([...matched, first, second]);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold dark:text-white">Movimientos: {moves}</h2>
        <button onClick={() => window.location.reload()} className="text-emerald-500 font-bold">Reiniciar</button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <div 
            key={index}
            onClick={() => handleFlip(index)}
            className="relative h-24 cursor-pointer"
          >
            <motion.div
              animate={{ rotateY: flippedCards.includes(index) || matched.includes(index) ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Parte Trasera (Oculta) */}
              <div className="absolute inset-0 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl" 
                   style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                {card.icon}
              </div>
              {/* Parte Frontal (Visible) */}
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 rounded-xl border-2 border-emerald-500/20 shadow-inner" 
                   style={{ backfaceVisibility: 'hidden' }}>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;