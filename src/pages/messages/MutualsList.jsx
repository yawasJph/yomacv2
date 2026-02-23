import React, { useState } from "react";
import { Search, MoreVertical } from "lucide-react";

const MutualsList = ({ mutuals, onSelectChat }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Lógica de filtrado reactiva
  const filteredMutuals = mutuals.filter((friend) =>
    friend.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* HEADER CON BUSCADOR */}
      <div className="p-4 space-y-4 bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black dark:text-white">Mensajes</h1>
          <button className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-zinc-200 transition-colors">
            <MoreVertical size={20} className="dark:text-zinc-400" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar amigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* LISTA DE CONVERSACIONES */}
      <div className="flex-1 overflow-y-auto">
        {filteredMutuals.length > 0 ? (
          filteredMutuals.map((friend) => (
            <button
              key={friend.friend_id}
              onClick={() => onSelectChat(friend)}
              className="w-full flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-b dark:border-zinc-900/50"
            >
              <div className="relative shrink-0">
                <img 
                  src={friend.avatar || "/default-avatar.png"} 
                  className="w-14 h-14 rounded-full object-cover border dark:border-zinc-800" 
                  alt={friend.full_name}
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full"></div>
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold dark:text-white text-[15px] truncate">
                    {friend.full_name}
                  </h3>
                  <span className="text-[11px] text-zinc-400 shrink-0">
                    {/* Aquí podrías poner la hora del último mensaje real más adelante */}
                    12:45 PM
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate pr-4">
                  @{friend.username || 'usuario'} • Toca para chatear
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="p-10 text-center text-zinc-500 text-sm">
            {searchTerm ? `No se encontró a "${searchTerm}"` : "No tienes amigos mutuos aún."}
          </div>
        )}
      </div>
    </div>
  );
};

export default MutualsList;