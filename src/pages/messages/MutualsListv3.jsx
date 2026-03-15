import React, { useState, useMemo, useCallback } from "react";
import { Search, ChevronLeft, HelpCircle, CheckCheck, Check } from "lucide-react";
import HelperModal from "./HelperModal";
import { MutualsSkeleton } from "@/components/skeletons/MutualsSkeleton";
import { useAuth } from "@/context/AuthContext";

// 1. Extraemos la función de formato fuera del componente para que no se redefine
const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

const MutualsList = ({
  mutuals = [], // Default value para evitar errores de undefined
  onSelectChat,
  onlineUsers,
  onBack,
  loadingMutuals,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { user } = useAuth();

  // 2. OPTIMIZACIÓN CLAVE: Memoizar el filtrado
  // Solo se vuelve a filtrar si cambian 'mutuals' o el 'searchTerm'
  const filteredMutuals = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return mutuals;
    
    return mutuals.filter(
      (friend) =>
        friend.full_name?.toLowerCase().includes(term) ||
        friend.username?.toLowerCase().includes(term)
    );
  }, [mutuals, searchTerm]);

  // 3. OPTIMIZACIÓN: Renderizado individual de items (podrías extraerlo a un sub-componente)
  const renderFriendItem = useCallback((friend) => {
    const isOnline = !!onlineUsers[friend.friend_id];
    const isLastMessageMine = friend.last_message_sender_id === user?.id;

    return (
      <button
        key={friend.friend_id}
        onClick={() => onSelectChat(friend)}
        className="w-full flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all border-b border-gray-100 dark:border-zinc-900 active:scale-[0.98]"
      >
        <div className="relative shrink-0">
          <img
            src={friend.avatar || "/default-avatar.png"}
            className="w-14 h-14 rounded-full object-cover border-2 border-transparent dark:border-zinc-800"
            alt={friend.full_name}
            loading="lazy" // Optimización de carga de imágenes
          />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full" />
          )}
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex justify-between items-baseline mb-0.5 gap-2">
            <h3 className="font-bold dark:text-white text-[15px] truncate flex-1">
              {friend.full_name}
            </h3>
            <span className={`text-[11px] shrink-0 ${friend.unread_count > 0 ? "text-indigo-500 font-bold" : "text-zinc-400"}`}>
              {friend.last_message_time ? formatMessageTime(friend.last_message_time) : ""}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
              {isLastMessageMine && (
                <span className="shrink-0">
                  {friend.last_message_is_read ? (
                    <CheckCheck size={14} className="text-cyan-500" />
                  ) : (
                    <Check size={14} className="text-zinc-400" />
                  )}
                </span>
              )}
              <p className="text-zinc-500 dark:text-zinc-400 truncate">
                {friend.last_message || `Saluda a ${friend.username}`}
              </p>
            </div>

            {friend.unread_count > 0 && (
              <span className="shrink-0 bg-indigo-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 animate-in zoom-in">
                {friend.unread_count}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }, [onlineUsers, user?.id, onSelectChat]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-white dark:bg-zinc-950">
      <div className="p-4 space-y-4 sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
              <ChevronLeft size={24} className="dark:text-white" />
            </button>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Mensajes</h1>
          </div>
          <button onClick={() => setIsHelpOpen(true)} className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500">
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar amigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-zinc-900 rounded-2xl text-[15px] dark:text-white outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {loadingMutuals ? (
          <MutualsSkeleton />
        ) : filteredMutuals.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-zinc-900">
            {filteredMutuals.map(renderFriendItem)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-400">
              <Search size={30} />
            </div>
            <p className="text-zinc-500 font-medium">
              {searchTerm ? `No hay resultados para "${searchTerm}"` : "Aún no tienes amigos mutuos."}
            </p>
          </div>
        )}
      </div>

      {isHelpOpen && <HelperModal onClose={() => setIsHelpOpen(false)} />}
    </div>
  );
};

// 4. MEMO PARA TODO EL COMPONENTE
export default React.memo(MutualsList);