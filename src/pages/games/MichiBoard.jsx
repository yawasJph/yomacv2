import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, RotateCcw, ArrowLeft, Zap, Flame, Clock } from 'lucide-react';
import { supabaseClient } from '../../supabase/supabaseClient';
import { getBestMove } from '../../components/games/utils/minimax';

const MichiBoard = ({ onBack }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerNext, setIsPlayerNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Al montar el componente, decidimos quién empieza
  useEffect(() => {
    const playerStarts = Math.random() > 0.5;
    setIsPlayerNext(playerStarts);
  }, []);

  // Control del turno de la IA
  useEffect(() => {
    if (!isPlayerNext && !winner) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 800); // Delay para "pensar"
      return () => clearTimeout(timer);
    }
  }, [isPlayerNext, winner]);

  const makeAIMove = () => {
    const bestMove = getBestMove([...board]);
    if (bestMove !== undefined) {
      const newBoard = [...board];
      newBoard[bestMove] = 'O';
      setBoard(newBoard);
      setIsPlayerNext(true);
      checkWinner(newBoard);
    }
  };

  const checkWinner = (currentBoard) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        const win = currentBoard[a];
        setWinner(win);
        setWinningLine(line);
        saveScore(win);
        return;
      }
    }

    if (!currentBoard.includes(null)) {
      setWinner('draw');
      saveScore('draw');
    }
  };

  const saveScore = async (result) => {
    setIsSaving(true);
    let points = 0;
    
    // Definimos puntos: Victoria (100), Empate (20), Derrota (0)
    if (result === 'X') points = 1000; 
    else if (result === 'draw') points = 100;
    else return setIsSaving(false); // Si perdió la IA, no guardamos nada o guardamos 0

    try {
      const { data, error } = await supabaseClient.rpc('submit_game_score', {
        p_game_id: 'michi',
        p_moves: 0,
        p_score: points,  
        p_time_seconds: 0
      });
      if (error) throw error;
      console.log("Resultado guardado:", data);
    } catch (err) {
      console.error("Error al guardar:", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsPlayerNext(Math.random() > 0.5); // Aleatorio en cada reinicio
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Header HUD */}
      <div className="w-full max-w-[320px] flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 bg-neutral-900 px-4 py-1.5 rounded-full border border-neutral-800">
            <Cpu size={14} className="text-purple-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">IA Imbatible</span>
          </div>
        </div>
        <button onClick={resetGame} className="p-2 text-gray-400 hover:text-emerald-500 transition-colors">
          <RotateCcw size={22} />
        </button>
      </div>

      {/* Indicador de Estado */}
      <div className="mb-6 h-6">
        <AnimatePresence mode="wait">
          {!winner && (
            <motion.p 
              key={isPlayerNext ? "tu" : "ia"}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2"
            >
              {isPlayerNext ? (
                <><Zap size={12} className="text-yellow-400 fill-yellow-400" /> Tu Turno</>
              ) : (
                <><span className="animate-pulse flex items-center gap-2">
                  <Cpu size={12} className="text-purple-500" /> IA Analizando...
                </span></>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Grid del Tablero */}
      <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-[2.5rem] border dark:border-neutral-800 shadow-2xl">
        {board.map((cell, i) => (
          <motion.button
            key={i}
            disabled={!!cell || !!winner || !isPlayerNext}
            onClick={() => {
                const newBoard = [...board];
                newBoard[i] = 'X';
                setBoard(newBoard);
                setIsPlayerNext(false);
                checkWinner(newBoard);
            }}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center transition-all border-b-4 active:border-b-0 active:translate-y-1
              ${!cell ? "bg-white dark:bg-neutral-900 border-gray-200 dark:border-black shadow-sm" : ""}
              ${cell === 'X' ? "bg-emerald-500 border-emerald-700 shadow-emerald-500/20" : ""}
              ${cell === 'O' ? "bg-rose-500 border-rose-700 shadow-rose-500/20" : ""}
              ${winningLine.includes(i) ? "brightness-125 scale-105 animate-bounce" : ""}
            `}
          >
            {cell === 'X' && <Zap size={38} fill="white" className="text-white drop-shadow-md" />}
            {cell === 'O' && <Flame size={38} fill="white" className="text-white drop-shadow-md" />}
          </motion.button>
        ))}
      </div>

      {/* Resultado Final */}
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 text-center">
            <h2 className={`text-5xl font-black uppercase italic tracking-tighter ${winner === 'X' ? 'text-emerald-500' : winner === 'draw' ? 'text-gray-400' : 'text-rose-500'}`}>
              {winner === 'X' ? 'GOD MODE' : winner === 'draw' ? 'EMPATE' : 'IA WINS'}
            </h2>
            <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">
              {winner === 'X' ? '+10 CRÉDITOS' : winner === 'draw' ? '+1 CRÉDITOS' : 'MÁS SUERTE LA PRÓXIMA'}
            </p>
            {/* <button onClick={resetGame} className="mt-6 px-10 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
              Revancha
            </button> */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MichiBoard;