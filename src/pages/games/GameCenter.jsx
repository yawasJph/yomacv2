import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthAction } from "../../hooks/useAuthAction";
import { GAMES_LIST } from "../../components/games/utils/GAMES_LIST";
import GameCard from "../../components/games/game-center/GameCard";
import GameCenterHeader from "../../components/games/game-center/GameCenterHeader";

const GameCenter = () => {
  const navigate = useNavigate();
  const { executeAction } = useAuthAction();

  const handleGameNavigate = (path) => {
    executeAction(() => navigate(path), "para jugar");
  };
  
  return (
    <div className="bg-white dark:bg-black p-4 ">
      {/* min-h-screen */}

      {/* Header */}
      <GameCenterHeader />

      {/* grid game cards*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAMES_LIST.map((game, index) => (
          <GameCard game={game} index={index} onPath={handleGameNavigate}  />
        ))}
      </div>

      {/* Sección de "Próximamente" o Stats rápidas */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
        <p className="text-gray-500 text-sm italic">
          Nuevos desafíos cada semana. ¡Mantente atento!
        </p>
      </div>

    </div>
  );
};

export default GameCenter;
