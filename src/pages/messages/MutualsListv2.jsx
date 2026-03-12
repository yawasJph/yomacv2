import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  HelpCircle,
  CheckCheck,
  Check,
} from "lucide-react";
import HelperModal from "./HelperModal";
import { MutualsSkeleton } from "@/components/skeletons/MutualsSkeleton";
import { useAuth } from "@/context/AuthContext";

const MutualsList = ({
  mutuals,
  onSelectChat,
  onlineUsers,
  onBack,
  loadingMutuals,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false); // Estado para el modal
  const {user} = useAuth()

  const filteredMutuals = mutuals.filter(
    (friend) =>
      friend.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full min-h-screen relative">
      {/* HEADER CON BUSCADOR */}
      <div className="p-4 space-y-4 bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
            >
              <ChevronLeft className="dark:text-white" />
            </button>
            <h1 className="text-2xl font-black dark:text-white">Mensajes</h1>
          </div>

          {/* BOTÓN DE AYUDA */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <HelpCircle
              size={20}
              className="text-zinc-500 dark:text-zinc-400"
            />
          </button>
        </div>

        {/* ... (resto del buscador igual) ... */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar amigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
          />
        </div>
      </div>

      {loadingMutuals ? (
        <MutualsSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto animate-fade-in-up ">
          {filteredMutuals.length > 0 ? (
            filteredMutuals.map((friend) => {
              const isOnline = !!onlineUsers[friend.friend_id];
              console.log(friend.last_message);
              return (
                <button
                  key={friend.friend_id}
                  onClick={() => onSelectChat(friend)}
                  // Añadimos "overflow-hidden" al botón para asegurar que nada escape
                  className="w-full flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-b border-gray-300 dark:border-gray-800"
                >
                  <div className="relative shrink-0">
                    <img
                      src={friend.avatar || "/default-avatar.png"}
                      className="w-14 h-14 rounded-full object-cover border dark:border-zinc-800"
                      alt={friend.full_name}
                    />
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full"></div>
                    )}
                  </div>

                  {/* CLAVE 1: El contenedor padre debe tener flex-1 y min-w-0 */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline mb-1 gap-2">
                      {/* CLAVE 2: El nombre también necesita truncate por si es muy largo */}
                      <h3 className="font-bold dark:text-white text-[15px] line-clamp-1 flex-1">
                        {friend.full_name}
                      </h3>
                      <span
                        className={`text-[11px] shrink-0 ${friend.unread_count > 0 ? "text-indigo-500 font-bold" : "text-zinc-400"}`}
                      >
                        {friend.last_message_time
                          ? formatMessageTime(friend.last_message_time)
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* CLAVE 3: El contenedor del mensaje debe ser flex-1 y min-w-0 */}
                      {/* <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                         {friend.last_message || `Saluda a ${friend.username}`} 
                        </p>
                      </div> */}
                      <div className="flex items-center gap-1 text-sm text-zinc-500">
                        {/* Solo mostramos el check si el último mensaje es MÍO */}
                        {friend.last_message_sender_id === user.id && (
                          <span className="shrink-0">
                            {friend.last_message_is_read ? (
                              <CheckCheck
                                size={14}
                                className="text-cyan-500"
                              /> // Doble check azul/indigo
                            ) : (
                              <Check size={14} className="text-zinc-400" /> // Un solo check gris
                            )}
                          </span>
                        )}

                        <span className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {friend.last_message || `Saluda a ${friend.username}`}
                        </span>
                      </div>

                      {/* El badge se mantiene con shrink-0 para que no se aplaste */}
                      {friend.unread_count > 0 && (
                        <span className="shrink-0 bg-indigo-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 animate-in zoom-in duration-300">
                          {friend.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-10 text-center text-zinc-500 text-sm">
              {searchTerm
                ? `No se encontró a "${searchTerm}"`
                : "No tienes amigos mutuos aún."}
            </div>
          )}
        </div>
      )}

      {/* --- UI DE AYUDA (MODAL/ACTION SHEET) --- */}
      {isHelpOpen && <HelperModal onClose={() => setIsHelpOpen(false)} />}
    </div>
  );
};

export default MutualsList;
