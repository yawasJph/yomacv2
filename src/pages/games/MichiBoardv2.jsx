import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, RotateCcw, ArrowLeft, Zap, Flame } from "lucide-react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { getBestMove } from "../../components/games/utils/minimax";
import useSound from "use-sound";
import { useAudio } from "../../context/AudioContext";

// 1. COMPONENTE MEMORIZADO: Solo se renderiza si cambia su prop 'value' o 'isWinning'
const Square = memo(({ value, onClick, disabled, isWinning }) => {
  return (
    <motion.button
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center transition-all border-b-4 active:border-b-0 active:translate-y-1
        ${!value ? "bg-white dark:bg-neutral-900 border-gray-200 dark:border-black shadow-sm" : ""}
        ${value === "X" ? "bg-emerald-500 border-emerald-700 shadow-emerald-500/20" : ""}
        ${value === "O" ? "bg-rose-500 border-rose-700 shadow-rose-500/20" : ""}
        ${isWinning ? "brightness-125 scale-105 animate-bounce" : ""}
      `}
    >
      {value === "X" && <Zap size={38} fill="white" className="text-white drop-shadow-md" />}
      {value === "O" && <Flame size={38} fill="white" className="text-white drop-shadow-md" />}
    </motion.button>
  );
});

const MichiBoard = ({ onBack }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerNext, setIsPlayerNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const { playWithCheck } = useAudio();

  // Sonidos
  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.6 });
  const [playLose] = useSound("/sounds/losev4.mp3", { volume: 0.4 });
  const [playDraw] = useSound("/sounds/draw.mp3", { volume: 0.4 });
  const [playReset] = useSound("/sounds/reset.mp3", { volume: 0.4 });

  // 2. USECALLBACK: La función de movimiento IA es estable
  const makeAIMove = useCallback(() => {
    const bestMove = getBestMove([...board]);
    if (bestMove !== undefined) {
      const newBoard = [...board];
      newBoard[bestMove] = "O";
      setBoard(newBoard);
      setIsPlayerNext(true);
      playWithCheck(playClick);
      checkWinner(newBoard);
    }
  }, [board, playClick, playWithCheck]);

  useEffect(() => {
    if (!isPlayerNext && !winner) {
      const timer = setTimeout(makeAIMove, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerNext, winner, makeAIMove]);

  // Lógica de guardado simplificada (Separada del flujo principal)
  const saveScore = async (result) => {
    let points = result === "X" ? 1000 : result === "draw" ? 100 : 0;
    if (points === 0) return;
    
    await supabaseClient.rpc("submit_game_score", {
      p_game_id: "michi",
      p_moves: 0,
      p_score: points,
      p_time_seconds: 0,
    });
  };

  const checkWinner = (currentBoard) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let line of lines) {
      const [a, b, c] = line;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        const win = currentBoard[a];
        setWinner(win);
        setWinningLine(line);
        win === "X" ? playWithCheck(playWin) : playWithCheck(playLose);
        saveScore(win);
        return;
      }
    }
    if (!currentBoard.includes(null)) {
      setWinner("draw");
      playWithCheck(playDraw);
      saveScore("draw");
    }
  };

  const handleSquareClick = useCallback((i) => {
    if (board[i] || winner || !isPlayerNext) return;
    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setIsPlayerNext(false);
    playWithCheck(playClick);
    checkWinner(newBoard);
  }, [board, winner, isPlayerNext, playClick, playWithCheck]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Header HUD onBack={onBack} onReset={() => { playWithCheck(playReset); setBoard(Array(9).fill(null)); setWinner(null); setWinningLine([]); }} />
      
      <StatusIndicator isPlayerNext={isPlayerNext} winner={winner} />

      {/* 3. GRID OPTIMIZADO: Renderiza componentes Square memorizados */}
      <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-[2.5rem] border dark:border-neutral-800 shadow-2xl">
        {board.map((cell, i) => (
          <Square
            key={i}
            value={cell}
            onClick={() => handleSquareClick(i)}
            disabled={!!cell || !!winner || !isPlayerNext}
            isWinning={winningLine.includes(i)}
          />
        ))}
      </div>

      <FinalResult winner={winner} />
    </div>
  );
};

// Sub-componentes para limpiar el return principal
const Header = ({ onBack, onReset }) => (
  <div className="w-full max-w-[320px] flex justify-between items-center mb-8">
    <button onClick={onBack} className="p-2 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"><ArrowLeft size={24} /></button>
    <div className="flex items-center gap-2 bg-neutral-900 px-4 py-1.5 rounded-full border border-neutral-800">
      <Cpu size={14} className="text-purple-500" />
      <span className="text-[10px] font-black text-white uppercase tracking-widest">IA Imbatible</span>
    </div>
    <button onClick={onReset} className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"><RotateCcw size={22} /></button>
  </div>
);

const StatusIndicator = ({ isPlayerNext, winner }) => (
  <div className="mb-6 h-6">
    <AnimatePresence mode="wait">
      {!winner && (
        <motion.p key={isPlayerNext ? "tu" : "ia"} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
          {isPlayerNext ? <><Zap size={12} className="text-yellow-400 fill-yellow-400" /> Tu Turno</> : <><span className="animate-pulse flex items-center gap-2"><Cpu size={12} className="text-purple-500" /> IA Analizando...</span></>}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const FinalResult = ({ winner }) => (
  <AnimatePresence>
    {winner && (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 text-center">
        <h2 className={`text-5xl font-black uppercase italic tracking-tighter ${winner === "X" ? "text-emerald-500" : winner === "draw" ? "text-gray-400" : "text-rose-500"}`}>
          {winner === "X" ? "GOD MODE" : winner === "draw" ? "EMPATE" : "IA WINS"}
        </h2>
        <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">
          {winner === "X" ? "+10 CRÉDITOS" : winner === "draw" ? "+1 CRÉDITOS" : "MÁS SUERTE LA PRÓXIMA"}
        </p>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MichiBoard;