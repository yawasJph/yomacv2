import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../../supabase/supabaseClient";
import {
  Zap,
  Flame,
  Swords,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

const MichiOnline = ({ user, onBack }) => {
  const [roomData, setRoomData] = useState(null);
  const [winner, setWinner] = useState(null);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const channelRef = useRef(null);

  /* ───────────────── MATCHMAKING ───────────────── */

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
        const randomTurn = players[Math.floor(Math.random() * 2)];

        const { data } = await supabaseClient
          .from("michi_rooms")
          .update({
            player_2: user.id,
            status: "playing",
            turn: randomTurn,
          })
          .eq("id", room.id)
          .select()
          .single();

        setRoomData(data);
      } else {
        const { data } = await supabaseClient
          .from("michi_rooms")
          .insert({
            player_1: user.id,
            status: "waiting",
            board: Array(9).fill(null),
          })
          .select()
          .single();

        setRoomData(data);
      }
    };

    findMatch();
  }, [user.id]);

  /* ───────────── REALTIME (ESTADO DEL ROOM) ───────────── */

  useEffect(() => {
    if (!roomData?.id) return;

    const channel = supabaseClient.channel(`room_${roomData.id}`);

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
          const updated = payload.new;
          setRoomData(updated);

          if (updated.status === "finished") {
            setWinner(updated.winner || "draw");
          }
        }
      )
      .subscribe();

    return () => supabaseClient.removeChannel(channel);
  }, [roomData?.id]);

  /* ───────────── PRESENCE (ABANDONO) ───────────── */

  useEffect(() => {
    if (!roomData?.id) return;

    const channel = supabaseClient.channel(
      `presence_${roomData.id}`,
      { config: { presence: { key: user.id } } }
    );

    channelRef.current = channel;

    channel
      .on("presence", { event: "leave" }, async ({ key }) => {
        const opponentId =
          user.id === roomData.player_1
            ? roomData.player_2
            : roomData.player_1;

        if (key !== opponentId) return;
        if (roomData.status !== "playing" || winner) return;

        setTimeout(async () => {
          const state = channel.presenceState();
          if (!state[opponentId]) {
            await handleOpponentLeft();
          }
        }, 1200);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: Date.now() });
        }
      });

    return () => channel.unsubscribe();
  }, [roomData?.id, roomData?.status, winner]);

  /* ───────────── GAME LOGIC ───────────── */

  const handleOpponentLeft = async () => {
    if (winner || opponentLeft) return;

    setOpponentLeft(true);
    setWinner(user.id);

    await supabaseClient
      .from("michi_rooms")
      .update({ status: "finished", winner: user.id })
      .eq("id", roomData.id)
      .eq("status", "playing");
  };

  const handleMove = async (index) => {
    if (
      roomData.board[index] ||
      winner ||
      roomData.turn !== user.id
    )
      return;

    const board = [...roomData.board];
    const symbol = user.id === roomData.player_1 ? "X" : "O";
    board[index] = symbol;

    const win = checkWinner(board);

    const updates = {
      board,
      turn:
        user.id === roomData.player_1
          ? roomData.player_2
          : roomData.player_1,
    };

    if (win) {
      updates.status = "finished";
      if (win !== "draw") updates.winner = user.id;
    }

    await supabaseClient
      .from("michi_rooms")
      .update(updates)
      .eq("id", roomData.id);
  };

  const checkWinner = (b) => {
    const l = [
      [0, 1, 2],[3, 4, 5],[6, 7, 8],
      [0, 3, 6],[1, 4, 7],[2, 5, 8],
      [0, 4, 8],[2, 4, 6],
    ];
    for (const [a, b1, c] of l)
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    return b.includes(null) ? null : "draw";
  };

  /* ───────────── UI FLOW ───────────── */

  if (!roomData || roomData.status === "waiting") {
    return <SearchingScreen onBack={onBack} />;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <AnimatePresence>
        {opponentLeft && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl mb-4 flex items-center gap-2 text-xs font-bold"
          >
            <AlertCircle size={16} /> El oponente abandonó
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-3 bg-gray-100 p-4 rounded-3xl">
        {roomData.board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleMove(i)}
            disabled={!!cell || winner}
            className="w-20 h-20 rounded-2xl bg-white"
          >
            {cell === "X" && <Zap />}
            {cell === "O" && <Flame />}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ───────────── SEARCHING UI ───────────── */

const SearchingScreen = ({ onBack }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <Loader2 size={64} className="animate-spin text-emerald-500 mb-6" />
    <button onClick={onBack} className="text-xs text-gray-500">
      <ArrowLeft size={14} /> Cancelar
    </button>
  </div>
);

export default MichiOnline;
