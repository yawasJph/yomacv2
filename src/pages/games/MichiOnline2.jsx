import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import { Zap, Flame, AlertCircle } from "lucide-react";
import MichiVersus from "./MichiVersus";
import confetti from "canvas-confetti";
import SearchingScreen from "../../components/games/SearchingScreen ";
import useSound from "use-sound";
import { useAudio } from "../../context/AudioContext";

const MichiOnline = ({ user, onBack }) => {
  const [gameState, setGameState] = useState("searching");
  const [roomData, setRoomData] = useState(null);
  const [winner, setWinner] = useState(null);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const { playWithCheck } = useAudio();

  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.6 });
  const [playLose] = useSound("/sounds/lose.mp3", { volume: 0.4 });
  const [playDraw] = useSound("/sounds/draw.mp3", { volume: 0.4 }); // Usamos matched para empate
  const [playReset] = useSound("/sounds/reset.mp3", { volume: 0.4 }); // Usamos matched para empate

  // --- 1. REGISTRO DE RESULTADOS ---
  useEffect(() => {
    if (!winner) return;
    
    const saveResult = async () => {
      try {
        // CASO A: VICTORIA (Solo el que ganó registra)
        if (winner !== "draw" && winner === user.id) {
          playWithCheck(playWin)
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#3b82f6", "#f59e0b"],
          });
          await supabaseClient.rpc("submit_game_score", {
            p_game_id: "michi_online",
            p_moves: 0,
            p_score: 300,
            p_time_seconds: 0,
          });
          console.log("DEBUG: Victoria guardada (+300 pts)");
        }

        // CASO B: EMPATE (Ambos registran)
        else if (winner === "draw") {
          playWithCheck(playDraw)
          await supabaseClient.rpc("submit_game_score", {
            p_game_id: "michi_online",
            p_moves: 0,
            p_score: 100, // Recompensa por esfuerzo
            p_time_seconds: 0,
          });
          console.log("DEBUG: Empate guardado (+100 pts)");
        }
      } catch (error) {
        console.error("DEBUG: Error al registrar puntos:", error);
      }
    };

    saveResult();
  }, [winner, user.id]);

  // --- 2. MATCHMAKING CON TURNO AL AZAR ---
  useEffect(() => {
    const findMatch = async () => {
      console.log("DEBUG: Iniciando Matchmaking...");
      const { data: room } = await supabaseClient
        .from("michi_rooms")
        .select("*")
        .eq("status", "waiting")
        .neq("player_1", user.id)
        .maybeSingle();

      if (room) {
        console.log("DEBUG: Sala encontrada. Uniéndose...");
        const players = [room.player_1, user.id];
        const randomTurn = players[Math.floor(Math.random() * 2)];

        const { data } = await supabaseClient
          .from("michi_rooms")
          .update({ player_2: user.id, status: "playing", turn: randomTurn })
          .eq("id", room.id)
          .select()
          .single();

        setRoomData(data);
        setGameState("versus");
      } else {
        console.log("DEBUG: No hay salas. Creando una nueva...");
        const { data } = await supabaseClient
          .from("michi_rooms")
          .insert({ player_1: user.id, status: "waiting", turn: user.id })
          .select()
          .single();
        setRoomData(data);
      }
    };
    findMatch();
  }, [user.id]);

  // --- 3. REALTIME Y DETECCIÓN DE ABANDONO ---
  useEffect(() => {
    if (!roomData?.id) return;

    // Usamos una variable de referencia para el ID del rival
    // Así evitamos que el efecto se reinicie cuando roomData cambie
    const currentRoomId = roomData.id;

    console.log("DEBUG: Creando canal estable para sala:", currentRoomId);
    const channel = supabaseClient.channel(`room_${currentRoomId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "michi_rooms",
          filter: `id=eq.${currentRoomId}`,
        },
        (payload) => {
          setRoomData(payload.new);
          // Cambiar a versus solo si no estamos ya jugando o terminando
          setGameState((prev) => {
            if (payload.new.player_2 && prev === "searching") return "versus";
            if (payload.new.status === "finished") return "playing"; // Mantener tablero
            return prev;
          });

          if (payload.new.status === "finished") {
            setWinner(payload.new.winner || "draw");
          }
        },
      )
      .on("presence", { event: "leave" }, ({ key }) => {
        // Obtenemos el oponente desde el ESTADO ACTUALIZADO de roomData
        // Pero usamos un truco: si el ID que sale NO es el mío, es el rival.
        if (key !== user.id && !winner) {
          console.log("DEBUG: El rival salió. Validando estado...");
          // Solo ganamos si el juego estaba en curso (playing)
          // setGameState(current => {
          //     if (current === "playing") {
          //         handleOpponentLeft(currentRoomId);
          //     }
          //     return current;
          // });
          setRoomData((currentRoom) => {
            if (currentRoom?.status === "finished" || currentRoom?.winner) {
              console.log(
                "DEBUG: El rival salió, pero la partida ya había terminado. No hay penalización.",
              );
              return currentRoom;
            }

            // Si llegamos aquí, es un abandono real en medio del juego
            setGameState((currentStatus) => {
              if (currentStatus === "playing") {
                console.log("DEBUG: ¡Abandono real detectado!");
                handleOpponentLeft(currentRoomId);
              }
              return currentStatus;
            });

            return currentRoom;
          });
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      // Solo limpiamos si el componente se desmonta (onBack)
      // O si la sala cambia de ID
      supabaseClient.removeChannel(channel);
    };
    // quitamos roomData y winner de las dependencias para que no se reinicie el canal
  }, [roomData?.id]);

  const handleOpponentLeft = async () => {
    setOpponentLeft(true);
    setWinner(user.id);
    await supabaseClient
      .from("michi_rooms")
      .update({ status: "finished", winner: user.id })
      .eq("id", roomData.id);
  };

  const handleMove = async (index) => {
    if (roomData.board[index] || winner || roomData.turn !== user.id) return;

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

    await supabaseClient
      .from("michi_rooms")
      .update(updates)
      .eq("id", roomData.id);
  };

  const handleExit = async () => {
    try {
      // 1. Desconectarse del canal inmediatamente para evitar eventos fantasma
      console.log("DEBUG: Saliendo de la sala y limpiando recursos...");

      // 2. Si la partida ya terminó, podemos intentar borrar la sala
      // Nota: Esto es opcional, también podrías dejarla marcada como 'finished'
      // Pero borrarla mantiene la tabla michi_rooms ligera.
      if (roomData?.id) {
        const { error } = await supabaseClient
          .from("michi_rooms")
          .delete()
          .eq("id", roomData.id);

        if (error) console.error("Error al limpiar sala:", error.message);
      }

      // 3. Volver al menú principal
      onBack();
    } catch (err) {
      console.error("Error en handleExit:", err);
      onBack(); // Salir de todos modos si algo falla
    }
  };

  const checkWinnerLocal = (board) => {
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
    for (let [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c])
        return board[a];
    }
    return board.includes(null) ? null : "draw";
  };

  // --- RENDERIZADO ---
  if (gameState === "searching") return <SearchingScreen onBack={handleExit} />;
  if (gameState === "versus")
    return (
      <MichiVersus
        roomData={roomData}
        onComplete={() => setGameState("playing")}
      />
    );

  return (
    <div className="flex flex-col items-center p-4 max-sm:p-2">
      {/* Alerta Visual de Abandono */}
      <AnimatePresence>
        {opponentLeft && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-rose-500 text-white px-6 py-3 max-sm:py-2 rounded-2xl mb-6 max-sm:mb-3 flex items-center gap-3 shadow-xl"
          >
            <AlertCircle size={20} />
            <span className="font-black text-[10px] uppercase tracking-widest">
              Rival desconectado - Victoria otorgada
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 max-sm:mb-3 flex flex-col items-center">
        <div
          className={`px-6 py-2 rounded-full border-2 transition-all ${
            roomData.turn === user.id
              ? "border-emerald-500 bg-emerald-500/10 animate-pulse"
              : "border-gray-200 opacity-50"
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">
            {roomData.turn === user.id ? "⚡ Tu Turno" : "⌛ Esperando..."}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-gray-100 dark:bg-neutral-800 p-4 rounded-[2.5rem]">
        {roomData.board.map((cell, i) => (
          <button
            key={i}
            onClick={() => {
              playWithCheck(playClick)
              handleMove(i)
            }}
            disabled={roomData.turn !== user.id || !!cell || !!winner}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-3xl transition-all
              ${!cell ? "bg-white dark:bg-neutral-900 shadow-inner" : ""}
              ${
                cell === "X"
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                  : ""
              }
              ${cell === "O" ? "bg-rose-500 shadow-lg shadow-rose-500/20" : ""}
            `}
          >
            {cell === "X" && (
              <Zap size={40} fill="white" className="text-white" />
            )}
            {cell === "O" && (
              <Flame size={40} fill="white" className="text-white" />
            )}
          </button>
        ))}
      </div>

      {winner && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 max-sm:mt-3 text-center"
        >
          <h2 className="text-4xl font-black italic uppercase dark:text-white">
            {winner === user.id
              ? "🏆 VICTORIA"
              : winner === "draw"
                ? "🤝 EMPATE"
                : "💀 DERROTA"}
          </h2>

          <button
            onClick={handleExit}
            className="mt-6 max-sm:mt-3 bg-emerald-500 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
          >
            Finalizar y Salir
          </button>
        </motion.div>
      )}

      {winner === "draw" && (
        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-2">
          +1 Credito
        </p>
      )}

      {winner && (
        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-2">
          +3 Creditos
        </p>
      )}
    </div>
  );
};

// const SearchingScreen = ({ onBack }) => (
//   <motion.div
//     initial={{ opacity: 0, scale: 0.9 }}
//     animate={{ opacity: 1, scale: 1 }}
//     exit={{ opacity: 0, scale: 0.9 }}
//     className="flex flex-col items-center justify-center min-h-[50vh] p-6"
//   >
//     <div className="relative flex items-center justify-center mb-6">
//       {/* Círculo de fondo con gradiente */}
//       <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 blur-sm" />

//       {/* Contenedor principal para espadas y borde */}
//       <div className="relative w-20 h-20 flex items-center justify-center">
//         {/* Borde circular animado (loader) */}
//         <motion.div
//           className="absolute inset-0 rounded-full border-4 border-transparent"
//           style={{
//             borderTopColor: '#10b981',
//             borderRightColor: '#34d399',
//             borderBottomColor: '#10b981',
//             borderLeftColor: '#34d399',
//             borderWidth: '3px'
//           }}
//           animate={{ rotate: 360 }}
//           transition={{
//             duration: 1.5,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//         />

//         {/* Espadas cruzadas en el centro */}
//         <motion.div
//           animate={{
//             rotate: [0, 5, -5, 0],
//             scale: [1, 1.05, 1, 1.05, 1],
//           }}
//           transition={{
//             duration: 2,
//             repeat: Infinity,
//             ease: "easeInOut"
//           }}
//         >
//           <Swords
//             size={32}
//             className="text-emerald-400 drop-shadow-lg"
//           />
//         </motion.div>

//         {/* Puntos decorativos en el borde */}
//         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
//         <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-150" />
//         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-300" />
//         <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-450" />
//       </div>
//     </div>

//     {/* Texto con animación */}
//     <motion.div
//       initial={{ y: 10, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ delay: 0.2 }}
//       className="text-center mb-8"
//     >
//       <h2 className="text-lg font-bold uppercase tracking-widest dark:text-white mb-2">
//         Buscando Oponente
//       </h2>
//       <motion.div
//         className="flex justify-center gap-1"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.4 }}
//       >
//         {[...Array(3)].map((_, i) => (
//           <motion.span
//             key={i}
//             className="text-emerald-500 text-2xl"
//             animate={{ y: [0, -5, 0] }}
//             transition={{
//               duration: 1,
//               repeat: Infinity,
//               delay: i * 0.2,
//             }}
//           >
//             .
//           </motion.span>
//         ))}
//       </motion.div>
//     </motion.div>

//     {/* Botón con mejor diseño */}
//     <motion.button
//       onClick={onBack}
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       className="group relative px-6 py-3 overflow-hidden rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 border border-gray-700 dark:border-gray-800"
//     >
//       {/* Efecto de brillo en hover */}
//       <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

//       <div className="relative flex items-center justify-center gap-3">
//         <ArrowLeft
//           size={16}
//           className="text-gray-400 group-hover:text-emerald-400 transition-colors duration-300"
//         />
//         <span className="text-gray-300 group-hover:text-white font-semibold text-sm uppercase tracking-wider transition-colors duration-300">
//           Cancelar Búsqueda
//         </span>
//       </div>
//     </motion.button>

//     {/* Indicador de estado */}
//     <motion.p
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ delay: 0.6 }}
//       className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs"
//     >
//       Esta operación puede tardar unos segundos
//     </motion.p>
//   </motion.div>
// );

export default MichiOnline;
