import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import { Zap, Flame, AlertCircle } from "lucide-react";
//import MichiVersus from "./MichiVersus";
import confetti from "canvas-confetti";
import useSound from "use-sound";
import { useAudio } from "../../context/AudioContext";
import SearchingScreen from "../../components/games/michi/SearchingScreenv4";
import MichiVersusv2 from "./MichiVersusv2";
import { useQueryClient } from "@tanstack/react-query";

// Lógica pura fuera del componente para evitar redeclaraciones
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const checkWinnerLocal = (board) => {
  for (let [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];
  }
  return board.includes(null) ? null : "draw";
};

const MichiOnline = ({ user, onBack, stop, onPlayVSIA }) => {
  const [gameState, setGameState] = useState("searching");
  const [roomData, setRoomData] = useState(null);
  const [winner, setWinner] = useState(null);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const { playWithCheck } = useAudio();
  const queryClient = useQueryClient();

  // Sonidos memorizados por useSound
  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.6 });
  const [playReady] = useSound("/sounds/ready-fight.mp3", { volume: 0.6 });
  const [playLose] = useSound("/sounds/losev4.mp3", { volume: 0.4 });
  const [playDraw] = useSound("/sounds/draw.mp3", { volume: 0.4 });

  // --- 1. MEMORIZAR EL MANEJO DE MOVIMIENTOS ---
  const handleMove = useCallback(
    async (index) => {
      if (
        !roomData ||
        roomData.board[index] ||
        winner ||
        roomData.turn !== user.id
      )
        return;

      const newBoard = [...roomData.board];
      const mySymbol = user.id === roomData.player_1 ? "X" : "O";
      newBoard[index] = mySymbol;

      const winResult = checkWinnerLocal(newBoard);
      const updates = {
        board: newBoard,
        turn:
          user.id === roomData.player_1 ? roomData.player_2 : roomData.player_1,
      };

      if (winResult) {
        updates.status = "finished";
        if (winResult !== "draw") updates.winner = user.id;
      }

      // Optimismo: Podrías actualizar el estado local aquí antes de Supabase
      await supabaseClient
        .from("michi_rooms")
        .update(updates)
        .eq("id", roomData.id);
    },
    [roomData, winner, user.id],
  );

  // --- 2. GESTIÓN DE SALIDA OPTIMIZADA ---
  const handleExit = useCallback(async () => {
    if (roomData?.id) {
      // Borramos la sala para no dejar basura en la DB
      await supabaseClient.from("michi_rooms").delete().eq("id", roomData.id);
    }
    onBack();
  }, [roomData?.id, onBack]);

  const handlePLayIA = useCallback(async () => {
    if (roomData?.id) {
      // Borramos la sala para no dejar basura en la DB
      await supabaseClient.from("michi_rooms").delete().eq("id", roomData.id);
    }
    onPlayVSIA();
  }, [roomData?.id, onBack]);

  // --- 3. EFECTO DE RESULTADOS (CORREGIDO) ---
  useEffect(() => {
    if (!winner) return;

    const saveResult = async () => {
      if (winner === "draw") {
        playWithCheck(playDraw);
        await supabaseClient.rpc("submit_game_score", {
          p_game_id: "michi_online",
          p_score: 100,
          p_moves: 0,
          p_time_seconds: 0,
        });
      } else if (winner === user.id) {
        playWithCheck(playWin);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

        try {
          const { error } = await supabaseClient.rpc("submit_game_score", {
            p_game_id: "michi_online",
            p_score: 300,
            p_moves: 0,
            p_time_seconds: 0,
          });

          if (!error) {
            console.log("Resultado guardado exitosamente");
            queryClient.invalidateQueries({
              queryKey: ["leaderboard", "michi_online"],
            });
          } else {
            console.error("Error al guardar resultado:", error);
          }
        } catch (error) {
          console.error("Error al guardar resultado:", error);
        }
      } else {
        playWithCheck(playLose);
      }
    };
    saveResult();
  }, [winner, user.id, playWin, playDraw, playLose, playWithCheck]);

  // --- 4. REALTIME ENGINE (OPTIMIZADO) ---
  useEffect(() => {
    if (!roomData?.id) return;

    const channel = supabaseClient.channel(`room_${roomData.id}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "michi_rooms",
          filter: `id=eq.${roomData.id}`,
        },
        (payload) => {
          const newData = payload.new;

          // Solo sonar si el tablero cambió y ahora es mi turno
          if (
            JSON.stringify(newData.board) !== JSON.stringify(roomData.board)
          ) {
            if (newData.turn === user.id) playWithCheck(playClick);
          }

          setRoomData(newData);

          if (newData.player_2 && gameState === "searching") {
            stop();
            playWithCheck(playReady);
            setGameState("versus");
          }

          if (newData.status === "finished") {
            setWinner(newData.winner || "draw");
          }
        },
      )
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key !== user.id && !winner) {
          setOpponentLeft(true);
          setWinner(user.id);
          playWithCheck(playWin);
        }
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [roomData?.id, user.id, gameState]); // Dependencias mínimas necesarias

  // Matchmaking inicial
  useEffect(() => {
    const findMatch = async () => {
      const { data: room } = await supabaseClient
        .from("michi_rooms")
        .select("*")
        .eq("status", "waiting")
        .neq("player_1", user.id)
        .maybeSingle();

      if (room) {
        const players = [room.player_1, user.id];
        const { data } = await supabaseClient
          .from("michi_rooms")
          .update({
            player_2: user.id,
            status: "playing",
            turn: players[Math.floor(Math.random() * 2)],
          })
          .eq("id", room.id)
          .select()
          .single();
        setRoomData(data);
        setGameState("versus");
      } else {
        const { data } = await supabaseClient
          .from("michi_rooms")
          .insert({
            player_1: user.id,
            status: "waiting",
            turn: user.id,
          })
          .select()
          .single();
        setRoomData(data);
      }
    };
    findMatch();
  }, [user.id]);

  // Vistas condicionales
  if (gameState === "searching")
    return <SearchingScreen onBack={handleExit} onPlayVSIA={handlePLayIA} />;
  if (gameState === "versus")
    return (
      <MichiVersusv2
        roomData={roomData}
        onComplete={() => setGameState("playing")}
      />
    );

  return (
    <div className="flex flex-col items-center p-4">
      <AnimatePresence>{opponentLeft && <AbandonAlert />}</AnimatePresence>

      <TurnIndicator isMyTurn={roomData?.turn === user.id} />

      <GameBoard
        board={roomData?.board || []}
        onMove={handleMove}
        disabled={roomData?.turn !== user.id || !!winner}
      />

      {winner && (
        <ResultDisplay winner={winner} userId={user.id} onExit={handleExit} />
      )}
    </div>
  );
};

// --- SUBCOMPONENTES MEMORIZADOS ---
const AbandonAlert = memo(() => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="bg-rose-500 text-white px-6 py-3 rounded-2xl mb-6 flex items-center gap-3 shadow-xl"
  >
    <AlertCircle size={20} />
    <span className="font-black text-[10px] uppercase tracking-widest">
      Rival desconectado - Victoria otorgada
    </span>
  </motion.div>
));

const TurnIndicator = memo(({ isMyTurn }) => (
  <div className="mb-8 flex flex-col items-center">
    <div
      className={`px-6 py-2 rounded-full border-2 transition-all ${isMyTurn ? "border-emerald-500 bg-emerald-500/10 animate-pulse" : "border-gray-200 opacity-50"}`}
    >
      <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">
        {isMyTurn ? "⚡ Tu Turno" : "⌛ Esperando..."}
      </span>
    </div>
  </div>
));

const GameBoard = memo(({ board, onMove, disabled }) => (
  <div className="grid grid-cols-3 gap-3 bg-gray-100 dark:bg-neutral-800 p-4 rounded-[2.5rem]">
    {board.map((cell, i) => (
      <button
        key={i}
        onClick={() => onMove(i)}
        disabled={disabled || !!cell}
        className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-3xl transition-all ${!cell ? "bg-white dark:bg-neutral-900 shadow-inner" : cell === "X" ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-rose-500 shadow-lg shadow-rose-500/20"}`}
      >
        {cell === "X" && <Zap size={40} fill="white" className="text-white" />}
        {cell === "O" && (
          <Flame size={40} fill="white" className="text-white" />
        )}
      </button>
    ))}
  </div>
));

const ResultDisplay = memo(({ winner, userId, onExit }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="mt-8 text-center"
  >
    <h2 className="text-4xl font-black italic uppercase dark:text-white">
      {winner === userId
        ? "🏆 VICTORIA"
        : winner === "draw"
          ? "🤝 EMPATE"
          : "💀 DERROTA"}
    </h2>
    <button
      onClick={onExit}
      className="mt-6 bg-emerald-500 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
    >
      Finalizar y Salir
    </button>
  </motion.div>
));

export default MichiOnline;
