import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient } from '../../supabase/supabaseClient';
import { Zap, Flame, Swords, Cpu, ArrowLeft, Loader2 } from 'lucide-react';
import MichiVersus from './MichiVersus'; // El componente que hicimos antes

const MichiOnline = ({ user, onBack }) => {
  const [gameState, setGameState] = useState('searching'); // searching, versus, playing
  const [roomData, setRoomData] = useState(null);
  const [winner, setWinner] = useState(null);

  // 1. Lógica de Matchmaking
  useEffect(() => {
    const findMatch = async () => {
      // Intentar unirse a una sala libre
      const { data: room } = await supabaseClient
        .from('michi_rooms')
        .select('*')
        .eq('status', 'waiting')
        .neq('player_1', user.id)
        .maybeSingle();

      if (room) {
        const { data } = await supabaseClient
          .from('michi_rooms')
          .update({ player_2: user.id, status: 'playing', turn: room.player_1 })
          .eq('id', room.id)
          .select().single();
        setRoomData(data);
        setGameState('versus');
      } else {
        // Crear nueva sala
        const { data } = await supabaseClient
          .from('michi_rooms')
          .insert({ player_1: user.id, status: 'waiting', turn: user.id })
          .select().single();
        setRoomData(data);
      }
    };

    findMatch();
  }, []);

  // 2. Suscripción Realtime
  useEffect(() => {
    if (!roomData?.id) return;

    const channel = supabaseClient
      .channel(`room_${roomData.id}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'michi_rooms', filter: `id=eq.${roomData.id}` },
        (payload) => {
          setRoomData(payload.new);
          if (payload.new.player_2 && gameState === 'searching') {
            setGameState('versus');
          }
          if (payload.new.winner || payload.new.is_draw) {
            setWinner(payload.new.winner || 'draw');
          }
        }
      ).subscribe();

    return () => supabaseClient.removeChannel(channel);
  }, [roomData?.id, gameState]);

  // 3. Función para Mover
  const handleMove = async (index) => {
    if (roomData.board[index] || winner || roomData.turn !== user.id) return;

    const newBoard = [...roomData.board];
    const mySymbol = user.id === roomData.player_1 ? 'X' : 'O';
    newBoard[index] = mySymbol;

    // Calcular victoria localmente antes de subir
    const winResult = checkWinnerLocal(newBoard);
    
    const updates = {
      board: newBoard,
      turn: user.id === roomData.player_1 ? roomData.player_2 : roomData.player_1
    };

    if (winResult) {
      if (winResult === 'draw') {
        updates.is_draw = true;
        updates.status = 'finished';
      } else {
        updates.winner = user.id;
        updates.status = 'finished';
      }
    }

    await supabaseClient.from('michi_rooms').update(updates).eq('id', roomData.id);
  };

  const checkWinnerLocal = (board) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return board.includes(null) ? null : 'draw';
  };

  // Renderizado Condicional
  if (gameState === 'searching') return <SearchingScreen onBack={onBack} />;
  
  if (gameState === 'versus') return (
    <MichiVersus 
      roomData={roomData} 
      onComplete={() => setGameState('playing')} 
    />
  );

  return (
    <div className="flex flex-col items-center p-4">
      {/* HUD de Turno Online */}
      <div className="mb-8 flex flex-col items-center">
        <div className={`px-6 py-2 rounded-full border-2 transition-all ${
          roomData.turn === user.id 
          ? "border-emerald-500 bg-emerald-500/10 animate-pulse" 
          : "border-gray-200 opacity-50"
        }`}>
          <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">
            {roomData.turn === user.id ? "⚡ Es tu turno" : "⌛ Esperando rival..."}
          </span>
        </div>
      </div>

      {/* Tablero Sincronizado */}
      <div className="grid grid-cols-3 gap-3 bg-gray-100 dark:bg-neutral-800 p-4 rounded-[2.5rem]">
        {roomData.board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleMove(i)}
            disabled={roomData.turn !== user.id || !!cell}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-3xl transition-all
              ${!cell ? "bg-white dark:bg-neutral-900 shadow-inner" : ""}
              ${cell === 'X' ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : ""}
              ${cell === 'O' ? "bg-rose-500 shadow-lg shadow-rose-500/20" : ""}
            `}
          >
            {cell === 'X' && <Zap size={40} fill="white" className="text-white" />}
            {cell === 'O' && <Flame size={40} fill="white" className="text-white" />}
          </button>
        ))}
      </div>

      {/* Resultado Final Online */}
      {winner && (
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="mt-8 text-center">
          <h2 className="text-4xl font-black italic uppercase dark:text-white">
            {winner === user.id ? "🏆 ¡Ganaste!" : winner === 'draw' ? "🤝 Empate" : "💀 Derrota"}
          </h2>
          <button onClick={onBack} className="mt-4 text-emerald-500 font-bold uppercase text-xs tracking-widest">
            Salir al Menú
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Pantalla de Búsqueda
const SearchingScreen = ({ onBack }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="relative mb-8">
      <Loader2 size={64} className="text-emerald-500 animate-spin" />
      <Swords size={24} className="absolute inset-0 m-auto text-gray-400" />
    </div>
    <h2 className="text-xl font-black italic dark:text-white mb-2">BUSCANDO RIVAL</h2>
    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Cotejando facultades...</p>
    <button onClick={onBack} className="mt-12 text-gray-500 text-xs font-bold flex items-center gap-2">
      <ArrowLeft size={14} /> CANCELAR
    </button>
  </div>
);

export default MichiOnline;