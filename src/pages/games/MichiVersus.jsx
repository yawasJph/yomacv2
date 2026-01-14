import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabaseClient } from '../../supabase/supabaseClient';
import { Zap, Flame, Swords } from 'lucide-react';

const MichiVersus = ({ roomData, currentUser, onComplete }) => {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data } = await supabaseClient
        .from('profiles')
        .select('full_name, carrera, avatar, id')
        .in('id', [roomData.player_1, roomData.player_2]);

      if (data) {
        setPlayer1(data.find(p => p.id === roomData.player_1));
        setPlayer2(data.find(p => p.id === roomData.player_2));
      }
    };
    fetchPlayers();

    // La pantalla dura 3 segundos y luego inicia el juego
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [roomData]);

  if (!player1 || !player2) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-linear-to-b from-emerald-500/10 to-rose-500/10 opacity-50" 
      />

      <div className="relative w-full max-w-lg flex flex-col items-center gap-12 p-6">
        
        {/* Jugador 1 - Izquierda (Rayo) */}
        <motion.div 
          initial={{ x: -200, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="flex items-center gap-4 self-start bg-white dark:bg-neutral-900 p-4 rounded-[2rem] shadow-2xl border-2 border-emerald-500 w-[80%]"
        >
          <div className="relative">
            <img src={player1.avatar} className="w-16 h-16 rounded-2xl object-cover" alt="p1" />
            <div className="absolute -top-2 -right-2 bg-emerald-500 p-1.5 rounded-lg shadow-lg">
              <Zap size={16} className="text-white fill-white" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-lg truncate dark:text-white uppercase italic">{player1.full_name.split(' ')[0]}</h3>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{player1.carrera}</p>
          </div>
        </motion.div>

        {/* VS ICON */}
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="bg-black dark:bg-white p-4 rounded-full z-10 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
        >
          <Swords size={32} className="text-white dark:text-black" />
        </motion.div>

        {/* Jugador 2 - Derecha (Fuego) */}
        <motion.div 
          initial={{ x: 200, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="flex items-center flex-row-reverse gap-4 self-end bg-white dark:bg-neutral-900 p-4 rounded-[2rem] shadow-2xl border-2 border-rose-500 w-[80%]"
        >
          <div className="relative">
            <img src={player2.avatar} className="w-16 h-16 rounded-2xl object-cover" alt="p2" />
            <div className="absolute -top-2 -left-2 bg-rose-500 p-1.5 rounded-lg shadow-lg">
              <Flame size={16} className="text-white fill-white" />
            </div>
          </div>
          <div className="min-w-0 text-right">
            <h3 className="font-black text-lg truncate dark:text-white uppercase italic">{player2.full_name.split(' ')[0]}</h3>
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{player2.carrera}</p>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mt-8"
        >
          Preparando Tablero...
        </motion.p>
      </div>
    </div>
  );
};

export default MichiVersus;