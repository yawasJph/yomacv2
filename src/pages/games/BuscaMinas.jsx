import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import useSound from "use-sound"; // 1. Importar la librería
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  RotateCcw,
  FileX2,
  Volume2, // Icono sonido activo
  VolumeX, // Icono silenciado
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const GRID_SIZE = 8;
const MINES_COUNT = 10;

const BuscaMinas = () => {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState("playing"); // playing, won, lost
  const [timer, setTimer] = useState(0);
  const [flagsCount, setFlagsCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // Estado del Mute
  const navigate = useNavigate();

  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playFlag] = useSound("/sounds/flag.mp3", { volume: 0.4 });
  const [playLose] = useSound("/sounds/lose.mp3", { volume: 0.6 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.7 });

  // Funciones wrapper para respetar el Mute
  const handlePlay = (soundFn) => {
    if (!isMuted) soundFn();
  };

  // 1. Inicializar el tablero
  const initBoard = useCallback(() => {
    let newBoard = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({
            isMine: false,
            revealed: false,
            flagged: false,
            neighborCount: 0,
          }))
      );

    // Colocar Minas (Exámenes)
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      if (!newBoard[r][c].isMine) {
        newBoard[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calcular números vecinos
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (newBoard[r + i]?.[c + j]?.isMine) count++;
            }
          }
          newBoard[r][c].neighborCount = count;
        }
      }
    }
    setBoard(newBoard);
    setGameState("playing");
    setTimer(0);
    setFlagsCount(0);
  }, []);

  // Función para poner/quitar bandera
  const toggleFlag = (e, r, c) => {
    e.preventDefault(); // Evita el menú contextual del navegador
    if (gameState !== "playing" || board[r][c].revealed) return;

    const newBoard = [...board.map((row) => [...row])];
    const isFlagging = !newBoard[r][c].flagged;

    // Limitar el número de banderas al número de minas
    if (isFlagging && flagsCount >= MINES_COUNT) {
      toast.error("No tienes más banderas");
      return;
    }

    handlePlay(playFlag);

    newBoard[r][c].flagged = isFlagging;
    setFlagsCount((prev) => (isFlagging ? prev + 1 : prev - 1));
    setBoard(newBoard);

    // Feedback háptico opcional
    if (navigator.vibrate) navigator.vibrate(50);
  };

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === "playing") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // 2. Revelar casilla (Recursivo si es vacío)
  const revealCell = (r, c) => {
    if (gameState !== "playing" || board[r][c].revealed || board[r][c].flagged)
      return;

    let newBoard = [...board.map((row) => [...row])];

    if (newBoard[r][c].isMine) {
      setGameState("lost");
      handlePlay(playLose);
      revealAllMines(newBoard);
      return;
    }

    handlePlay(playClick);

    const floodFill = (row, col) => {
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
      if (newBoard[row][col].revealed || newBoard[row][col].isMine) return;

      newBoard[row][col].revealed = true;
      if (newBoard[row][col].neighborCount === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            floodFill(row + i, col + j);
          }
        }
      }
    };

    floodFill(r, c);
    setBoard(newBoard);
    checkWin(newBoard);
  };

  const revealAllMines = (tempBoard) => {
    tempBoard.forEach((row) =>
      row.forEach((cell) => {
        if (cell.isMine) cell.revealed = true;
      })
    );
    setBoard(tempBoard);
  };

  const checkWin = (currentBoard) => {
    const hasWon = currentBoard.every((row) =>
      row.every((cell) => cell.isMine || cell.revealed)
    );
    if (hasWon) {
      setGameState("won");
      handlePlay(playWin);
      saveScore(true);
    }
  };

  const saveScore = async (isWin) => {
    const score = isWin ? Math.max(1000 - timer, 100) : 0;
    if (score > 0) {
      const { data, error } = await supabaseClient.rpc("submit_game_score", {
        p_game_id: "buscaminas",
        p_score: score,
        p_moves: 0,
        p_time_seconds: timer,
      });

      if (error) toast.error("No se pudo guardar el puntaje");
      toast.success("¡Ranking actualizado!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col h-full bg-gray-50 dark:bg-neutral-950 rounded-[2.5rem]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl transition-colors ${
              isMuted
                ? "text-red-500 bg-red-50 dark:bg-red-500/10"
                : "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
            }`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div className="bg-white dark:bg-neutral-800 px-3 py-2 rounded-2xl border-2 border-amber-500/20 flex items-center gap-2">
            <span className="text-sm">🚩</span>
            <span className="font-black dark:text-white text-xs">
              {MINES_COUNT - flagsCount}
            </span>
          </div>
          <div className="bg-white dark:bg-neutral-800 px-3 py-2 rounded-2xl border-2 border-emerald-500/20 flex items-center gap-2">
            <Clock size={16} className="text-emerald-500" />
            <span className="font-black dark:text-white text-xs">{timer}s</span>
          </div>
        </div>
        <button
          onClick={initBoard}
          className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Instrucciones rápidas */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-black uppercase italic dark:text-white tracking-tighter">
          Examen <span className="text-emerald-500">Sorpresa</span>
        </h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
          ¡Evita los jalados y aprueba el semestre!
        </p>
      </div>

      {/* Grid del Juego */}
      <div className="relative mx-auto bg-gray-200 dark:bg-neutral-900 p-2 rounded-4xl shadow-inner">
        <div className="grid grid-cols-8 gap-1.5 mx-auto">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <motion.button
                key={`${r}-${c}`}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                onTapHold={(e) => toggleFlag(e, r, c)}
                onClick={() => revealCell(r, c)}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm transition-all relative
                ${
                  cell.revealed
                    ? cell.isMine
                      ? "bg-red-500 shadow-inner"
                      : "bg-white dark:bg-neutral-800"
                    : cell.flagged
                    ? "bg-amber-100 dark:bg-amber-500/20 border-2 border-amber-500 shadow-none"
                    : "bg-emerald-500 shadow-[0_4px_0_0_#059669] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#059669]"
                }`}
              >
                <AnimatePresence mode="wait">
                  {cell.revealed ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex flex-col items-center justify-center"
                    >
                      {cell.isMine ? (
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] leading-none text-white font-black bg-red-800 px-1 rounded-sm mb-0.5">
                            05
                          </span>
                          <FileX2 size={16} color="white" />
                        </div>
                      ) : (
                        <span
                          className={`
                        ${cell.neighborCount === 0 ? "opacity-0" : ""}
                        ${cell.neighborCount === 1 ? "text-blue-500" : ""}
                        ${cell.neighborCount === 2 ? "text-emerald-500" : ""}
                        ${cell.neighborCount === 3 ? "text-orange-500" : ""}
                        ${cell.neighborCount >= 4 ? "text-red-600" : ""}
                      `}
                        >
                          {cell.neighborCount > 0 ? cell.neighborCount : ""}
                        </span>
                      )}
                    </motion.div>
                  ) : cell.flagged ? (
                    <motion.span
                      initial={{ scale: 0, y: -5 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      className="text-lg"
                    >
                      🚩
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Modal de Estado Ahora Centrado */}
      <AnimatePresence>
        {gameState !== "playing" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <div className="max-w-md w-full p-6 rounded-[2.5rem] text-center bg-white dark:bg-neutral-900 shadow-2xl border-2 border-gray-100 dark:border-neutral-800 relative overflow-hidden">
              {/* Adorno de fondo */}
              <div
                className={`absolute top-0 left-0 w-full h-1.5 ${
                  gameState === "won" ? "bg-emerald-500" : "bg-red-500"
                }`}
              />

              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  gameState === "won" ? "bg-emerald-100" : "bg-red-100"
                }`}
              >
                {gameState === "won" ? (
                  <GraduationCap size={32} className="text-emerald-600" />
                ) : (
                  <span className="text-2xl font-black text-red-600 italic">
                    05
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black uppercase dark:text-white tracking-tighter leading-tight">
                {gameState === "won" ? "¡Semestre Invicto!" : "¡Examen Jalado!"}
              </h3>

              <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-[0.2em]">
                {gameState === "won"
                  ? `Aprobaste en solo ${timer} segundos`
                  : "Te descuidaste y te mandaron a la bica"}
              </p>

              <button
                onClick={initBoard}
                className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
              >
                Volver a Matricularme
              </button>
              <button
                onClick={() => navigate(-1)}
                className="mt-3 w-full bg-neutral-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-transform active:scale-95"
              >
                Volver al Arcade
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuscaMinas;
