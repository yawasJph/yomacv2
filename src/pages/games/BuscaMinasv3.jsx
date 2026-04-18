import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import useSound from "use-sound";
import {
  ArrowLeft,
  Clock,
  RotateCcw,
  FileX2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../../context/AudioContext";
import { notify } from "@/utils/toast/notifyv3";
import { useQueryClient } from "@tanstack/react-query";
import BuscaMinasResults from "@/components/games/minas/BuscaMinasResults";
import { useAuth } from "@/context/AuthContext";
import { useWeeklyBestScore } from "@/hooks/games/useWeeklyBestScore";


const calculateScore = ({ timer, flagsUsed, minesCount, isWin }) => {
  if (!isWin) return 0;
  let score = 1000;

  // ⏱️ TIEMPO (importante pero no dominante)
  score -= timer * 5;

  // 🚩 EFICIENCIA DE FLAGS
  // ideal = usar pocas flags (skill alto)
  const flagRatio = flagsUsed / minesCount;

  // mientras menos uses, mejor
  const efficiencyBonus = (1 - flagRatio) * 300;
  score += efficiencyBonus;

  // 💣 USO EXCESIVO (castigo si usa todas)
  if (flagsUsed === minesCount) {
    score -= 100;
  }

  // 🧠 BONUS PRO (casi sin flags)
  if (flagsUsed <= 3) {
    score += 150;
  }

  // 💎 PERFECT RUN (rápido + pocas flags)
  if (timer < 60 && flagsUsed <= 5) {
    score += 150;
  }

  return Math.max(Math.floor(score), 100);
};

// --- Constantes y Utilidades Externas ---
const GRID_SIZE = 8;
const MINES_COUNT = 10;

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

// Generación del tablero inicial vacío
const createEmptyBoard = () =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      isMine: false,
      revealed: false,
      flagged: false,
      neighborCount: 0,
    })),
  );

// --- Componente de Celda Optimizado ---
const Cell = memo(({ r, c, cell, onClick, onContextMenu }) => {
  return (
    <motion.button
      onContextMenu={(e) => onContextMenu(e, r, c)}
      onClick={() => onClick(r, c)}
      whileTap={{ scale: 0.9 }}
      className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm transition-all relative
        ${
          cell.revealed
            ? cell.isMine
              ? "bg-red-500 shadow-inner"
              : "bg-white dark:bg-neutral-800"
            : cell.flagged
              ? "bg-amber-100 dark:bg-amber-500/20 border-2 border-amber-500"
              : "bg-emerald-500 shadow-[0_4px_0_0_#059669] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#059669]"
        }`}
    >
      <AnimatePresence mode="wait">
        {cell.revealed ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            {cell.isMine ? (
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-white bg-red-800 px-1 rounded-sm">
                  05
                </span>
                <FileX2 size={16} color="white" />
              </div>
            ) : (
              <span
                className={`
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
          >
            🚩
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
});

// --- Componente Principal ---
const BuscaMinas = () => {
  const { user } = useAuth();
  const [board, setBoard] = useState(createEmptyBoard());
  const [gameState, setGameState] = useState("playing");
  const [timer, setTimer] = useState(0);
  const [flagsCount, setFlagsCount] = useState(0);
  //const [isMuted, setIsMuted] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const { isMuted, setIsMuted, playWithCheck } = useAudio();
  const queryClient = useQueryClient();
  const [clicks, setClicks] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const navigate = useNavigate();

  // <-- Obtenemos el mejor puntaje semanal de Buscaminas
  const { data: bestWeeklyScore } = useWeeklyBestScore(user?.id, "buscaminas");

  // Sonidos
  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playFlag] = useSound("/sounds/flag.mp3", { volume: 0.4 });
  const [playLose] = useSound("/sounds/lose.mp3", { volume: 0.6 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.7 });

  const flagsUsed = board.flat().filter((cell) => cell.flagged).length;

  const correctFlags = board
    .flat()
    .filter((cell) => cell.flagged && cell.isMine).length;

  const flagEfficiency = Math.max(0, 100 - (flagsUsed - correctFlags) * 10);

  // Lógica para plantar minas DESPUÉS del primer clic (para no perder al inicio)
  const plantMines = (initialBoard, firstR, firstC) => {
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      // Evitar el lugar del primer clic y donde ya hay minas
      if (!initialBoard[r][c].isMine && (r !== firstR || c !== firstC)) {
        initialBoard[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calcular vecinos
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!initialBoard[r][c].isMine) {
          let count = 0;
          DIRECTIONS.forEach(([dr, dc]) => {
            if (initialBoard[r + dr]?.[c + dc]?.isMine) count++;
          });
          initialBoard[r][c].neighborCount = count;
        }
      }
    }
    return initialBoard;
  };

  const initGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setGameState("playing");
    setTimer(0);
    setFlagsCount(0);
    setFirstClick(true);
    setClicks(0);
    setIsNewRecord(false);
  }, []);

  const revealCell = useCallback(
    (r, c) => {
      if (
        gameState !== "playing" ||
        board[r][c].revealed ||
        board[r][c].flagged
      )
        return;

      setClicks((prev) => prev + 1); // 👈 AQUÍ

      let newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

      // Si es el primer clic, generamos las minas ahora
      if (firstClick) {
        newBoard = plantMines(newBoard, r, c);
        setFirstClick(false);
      }

      if (newBoard[r][c].isMine) {
        setGameState("lost");
        playWithCheck(playLose);
        // Revelar todas
        newBoard.forEach((row) =>
          row.forEach((cell) => {
            if (cell.isMine) cell.revealed = true;
          }),
        );
        setBoard(newBoard);
        return;
      }

      playWithCheck(playClick);

      const floodFill = (row, col) => {
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
        if (
          newBoard[row][col].revealed ||
          newBoard[row][col].isMine ||
          newBoard[row][col].flagged
        )
          return;

        newBoard[row][col].revealed = true;
        if (newBoard[row][col].neighborCount === 0) {
          DIRECTIONS.forEach(([dr, dc]) => floodFill(row + dr, col + dc));
        }
      };

      floodFill(r, c);
      setBoard(newBoard);

      // Check Win
      const hasWon = newBoard.every((row) =>
        row.every((cell) => cell.isMine || cell.revealed),
      );
      if (hasWon) {
        setGameState("won");
        playWithCheck(playWin);
        saveScore(true);
      }
    },
    [board, gameState, firstClick, playClick, playLose, playWin, playWithCheck],
  );

  const toggleFlag = useCallback(
    (e, r, c) => {
      e.preventDefault();
      if (gameState !== "playing" || board[r][c].revealed) return;

      if (!board[r][c].flagged && flagsCount >= MINES_COUNT) {
        notify.error("No tienes más banderas");
        return;
      }

      playWithCheck(playFlag);
      const newBoard = [...board];
      newBoard[r][c] = { ...newBoard[r][c], flagged: !newBoard[r][c].flagged };
      setFlagsCount((prev) => (newBoard[r][c].flagged ? prev + 1 : prev - 1));
      setBoard(newBoard);
      if (navigator.vibrate) navigator.vibrate(50);
    },
    [board, gameState, flagsCount, playWithCheck, playFlag],
  );

  // Timer Effect
  useEffect(() => {
    let interval;
    if (gameState === "playing" && !firstClick) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, firstClick]);

  const saveScore = async (isWin) => {
    const score2 = calculateScore({
      timer: timer,
      flagsUsed: flagsCount,
      minesCount: MINES_COUNT,
      isWin: isWin,
    });

    // <-- Lógica de Récord
    if (isWin && (bestWeeklyScore === null || score2 > bestWeeklyScore)) {
      setIsNewRecord(true);
    }

    try {
      const { error } = await supabaseClient.rpc("submit_game_score", {
        p_game_id: "buscaminas",
        p_score: score2,
        p_moves: clicks,
        p_time_seconds: timer,
      });
      if (!error) {
        console.log("Puntaje guardado exitosamente");
        queryClient.invalidateQueries({
          queryKey: ["leaderboard", "buscaminas"],
        });
        // <-- Invalidamos también el caché del récord
        queryClient.invalidateQueries({
          queryKey: ["weekly-best-score", user?.id, "buscaminas"],
        });
      }
    } catch (error) {
      console.error("Error al guardar el puntaje:", error);
      notify.error("Error al guardar el puntaje");
    }
  };

  const SoundToggle = (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setIsMuted(!isMuted)}
      className={`p-2 rounded-2xl transition-all shadow-lg ${
        isMuted
          ? "bg-gray-500 text-white"
          : "bg-white dark:bg-neutral-900 text-amber-500 border border-amber-500/20"
      }`}
    >
      {isMuted ? (
        <VolumeX size={24} />
      ) : (
        <Volume2 size={24} className="animate-pulse" />
      )}
    </motion.button>
  );

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col h-full bg-gray-50 dark:bg-neutral-950 rounded-[2.5rem] md:mt-15">
      {/* UI de Header (igual a la tuya, pero usando initGame) */}
      <header className="flex justify-between items-center mb-6 px-2">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div className="flex gap-3">
          {SoundToggle}
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
          onClick={initGame}
          className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg"
        >
          <RotateCcw size={20} />
        </button>
      </header>

      {/* Grid */}
      <div className="relative mx-auto bg-gray-200 dark:bg-neutral-900 p-2 rounded-4xl shadow-inner">
        <div className="grid grid-cols-8 gap-1.5 mx-auto">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <Cell
                key={`${r}-${c}`}
                r={r}
                c={c}
                cell={cell}
                onClick={revealCell}
                onContextMenu={toggleFlag}
              />
            )),
          )}
        </div>
      </div>

      {/* Modales de Victoria/Derrota */}
      <AnimatePresence>
        {gameState !== "playing" && (
          <BuscaMinasResults
            gameState={gameState}
            timer={timer}
            flagsUsed={flagsCount}
            minesCount={MINES_COUNT}
            clicks={clicks}
            onReset={initGame}
            isNewRecord={isNewRecord}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuscaMinas;
