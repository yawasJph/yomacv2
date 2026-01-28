import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowLeft, Zap, Flame } from "lucide-react";
import useSound from "use-sound";
import { useAudio } from "../../context/AudioContext";

const MichiPVP = ({ onBack }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // X es Jugador 1, O es Jugador 2
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const { playWithCheck } = useAudio();

  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.6 });
  const [playDraw] = useSound("/sounds/draw.mp3", { volume: 0.4 }); // Usamos matched para empate
  const [playReset] = useSound("/sounds/reset.mp3", { volume: 0.4 }); // Usamos matched para empate

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner.winner);
      setWinningLine(gameWinner.line);
      playWithCheck(playWin)
    } else if (!newBoard.includes(null)) {
      playWithCheck(playDraw)
      setWinner("draw");
    } else {
      setIsXNext(!isXNext);
    }
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const resetGame = () => {
    playWithCheck(playReset)
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* HUD de Jugadores */}
      <div className="w-full max-w-[340px] flex justify-between items-center mb-8 gap-4">
        <button onClick={onBack} className="p-2 text-gray-400">
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-4 flex-1 justify-center">
          {/* Jugador 1 */}
          <div
            className={`flex flex-col items-center transition-opacity ${!isXNext && !winner ? "opacity-30" : "opacity-100"}`}
          >
            <div className="bg-emerald-500 p-2 rounded-xl mb-1 shadow-lg shadow-emerald-500/20">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="text-[8px] font-black text-gray-500 uppercase">
              Player 1
            </span>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-neutral-800" />

          {/* Jugador 2 */}
          <div
            className={`flex flex-col items-center transition-opacity ${isXNext && !winner ? "opacity-30" : "opacity-100"}`}
          >
            <div className="bg-rose-500 p-2 rounded-xl mb-1 shadow-lg shadow-rose-500/20">
              <Flame size={18} className="text-white fill-white" />
            </div>
            <span className="text-[8px] font-black text-gray-500 uppercase">
              Player 2
            </span>
          </div>
        </div>

        <button onClick={resetGame} className="p-2 text-gray-400">
          <RotateCcw size={22} />
        </button>
      </div>

      {/* Tablero */}
      <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-neutral-900/50 p-4 rounded-[2.5rem] border dark:border-neutral-800 shadow-xl">
        {board.map((cell, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playWithCheck(playClick)
              handleClick(i)
            }}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center transition-all border-b-4
              ${!cell ? "bg-white dark:bg-neutral-800 border-gray-200 dark:border-black" : ""}
              ${cell === "X" ? "bg-emerald-500 border-emerald-700 shadow-lg shadow-emerald-500/20" : ""}
              ${cell === "O" ? "bg-rose-500 border-rose-700 shadow-lg shadow-rose-500/20" : ""}
              ${winningLine.includes(i) ? "brightness-125 scale-105" : ""}
            `}
          >
            <AnimatePresence>
              {cell === "X" && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                >
                  <Zap size={40} fill="white" className="text-white" />
                </motion.div>
              )}
              {cell === "O" && (
                <motion.div
                  initial={{ scale: 0, rotate: 20 }}
                  animate={{ scale: 1, rotate: 0 }}
                >
                  <Flame size={40} fill="white" className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Mensaje de Turno / Resultado */}
      <div className="mt-10 text-center min-h-[100px]">
        {!winner ? (
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
            Turno de {isXNext ? "Player 1" : "Player 2"}
          </p>
        ) : (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2
              className={`text-5xl font-black italic uppercase tracking-tighter ${winner === "X" ? "text-emerald-500" : winner === "O" ? "text-rose-500" : "text-gray-400"}`}
            >
              {winner === "draw"
                ? "EMPATE"
                : winner === "X"
                  ? "P1 WINS"
                  : "P2 WINS"}
            </h2>
            <button
              onClick={resetGame}
              className="mt-6 px-10 py-3 bg-gray-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
            >
              Nueva Partida
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MichiPVP;
