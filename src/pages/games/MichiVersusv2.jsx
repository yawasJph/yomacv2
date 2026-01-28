import React, { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { supabaseClient } from '../../supabase/supabaseClient';
import { Zap, Flame, Swords } from 'lucide-react';

// Extraemos las variantes de animación para que no se recalculen en cada render
const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const MichiVersus = ({ roomData, onComplete }) => {
  const [players, setPlayers] = useState({ p1: null, p2: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Variable para evitar actualizar el estado si el componente se desmonta
    let isMounted = true;

    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('full_name, carrera, avatar, id')
          .in('id', [roomData.player_1, roomData.player_2]);

        if (error) throw error;

        if (data && isMounted) {
          setPlayers({
            p1: data.find(p => p.id === roomData.player_1),
            p2: data.find(p => p.id === roomData.player_2)
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching players:", err);
      }
    };

    fetchPlayers();

    const timer = setTimeout(() => {
      if (isMounted) onComplete();
    }, 3800); // Un poco más de tiempo para apreciar las animaciones

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [roomData.player_1, roomData.player_2, onComplete]);

  // Si aún no hay datos, mostramos un fondo neutro o un loader sutil
  if (loading || !players.p1 || !players.p2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Swords size={40} className="text-white opacity-20" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black overflow-hidden"
    >
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-linear-to-b from-emerald-500/10 to-rose-500/10 opacity-50" />

      <div className="relative w-full max-w-lg flex flex-col items-center gap-12 p-6">
        
        {/* Jugador 1 - Izquierda */}
        <PlayerCard 
          player={players.p1} 
          icon={<Zap size={16} className="text-white fill-white" />}
          color="emerald"
          side="left"
        />

        {/* VS ICON con efecto de pulso */}
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="bg-black dark:bg-white p-5 rounded-full z-10 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
        >
          <Swords size={32} className="text-white dark:text-black" />
        </motion.div>

        {/* Jugador 2 - Derecha */}
        <PlayerCard 
          player={players.p2} 
          icon={<Flame size={16} className="text-white fill-white" />}
          color="rose"
          side="right"
        />

        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: [0, 1, 0] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mt-8"
        >
          Preparando Tablero...
        </motion.p>
      </div>
    </motion.div>
  );
};

// Subcomponente interno para no repetir código de UI
const PlayerCard = memo(({ player, icon, color, side }) => {
  const isLeft = side === "left";
  return (
    <motion.div 
      initial={{ x: isLeft ? -200 : 200, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 15, delay: 0.1 }}
      className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-4 ${isLeft ? 'self-start' : 'self-end'} 
        bg-white dark:bg-neutral-900 p-4 rounded-4xl shadow-2xl border-2 ${isLeft ? 'border-emerald-500' : 'border-rose-500'} w-[85%]`}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={player.avatar || "/default-avatar.png"} 
          className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 dark:border-neutral-800" 
          alt="avatar" 
        />
        <div className={`absolute -top-2 ${isLeft ? '-right-2' : '-left-2'} bg-${color}-500 p-1.5 rounded-lg shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className={`min-w-0 ${isLeft ? 'text-left' : 'text-right'}`}>
        <h3 className="font-black text-lg truncate dark:text-white uppercase italic leading-none">
          {player.full_name?.split(' ')[0] || "Jugador"}
        </h3>
        <p className={`text-[9px] font-bold text-${color}-500 uppercase tracking-widest mt-1`}>
          {player.carrera || "Invitado"}
        </p>
      </div>
    </motion.div>
  );
});

export default memo(MichiVersus);