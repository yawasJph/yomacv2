import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, Trash2, Save, MoreVertical } from "lucide-react";
import { notify } from "@/utils/toast/notifyv3";
import ConfirmModal from "@/components/modals/ConfirmModalv2";
import { InputMessage } from "./InputMessage";
import { ChatSkeleton } from "@/components/skeletons/ChatSkeleton";
import { HeaderSkeleton } from "@/components/skeletons/HeaderSkeletonChat";
import { useChat } from "@/hooks/messages/useChatv2";
// Asegúrate de que la ruta sea correcta

const ChatWindow = ({
  activeChat,
  user,
  onBack,
  onlineUsers,
  isMobile,
}) => {
  const scrollRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Extraemos toda la lógica del Hook que creamos
  const { 
    messages, 
    loading, 
    isFriendTyping, 
    sendTypingSignal, 
    sendMessage,
    deleteMessage,
    isDeleting ,
  } = useChat(user.id, activeChat.friend_id);

  const isFriendOnline = !!onlineUsers[activeChat.friend_id];

  // EFECTO: Scroll automático al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isFriendTyping]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleConfirmDelete = () => {
    if (!selectedMessage) return;
    deleteMessage(selectedMessage.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedMessage(null);
        notify.success("Mensaje eliminado");
      }
    });
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setSelectedMessage(null);
    notify.success("Mensaje copiado");
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("es-MX", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateString));
  };

  console.log(isFriendTyping)
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* HEADER DEL CHAT */}
      <div className={`flex justify-between items-center gap-5 p-4 md:p-6 bg-white/90 dark:bg-black/90 backdrop-blur-xl z-40 border-b border-gray-200 dark:border-gray-800/50 sticky top-15 shadow-sm transition-all`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <ChevronLeft className="dark:text-white" />
          </button>
          
          {loading ? <HeaderSkeleton /> : (
            <>
              <div className="relative">
                <img
                  src={activeChat.avatar || "/default-avatar.png"}
                  className="w-10 h-10 rounded-full object-cover border dark:border-zinc-800"
                  alt={activeChat.full_name}
                />
                {isFriendOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full"></div>
                )}
              </div>
              <div>
                <span className="font-bold dark:text-white text-sm block leading-none">{activeChat.full_name}</span>
                <span className="text-[10px] font-medium">
                  {isFriendTyping ? (
                    <span className="text-indigo-500 animate-pulse">Escribiendo...</span>
                  ) : isFriendOnline ? (
                    <span className="text-green-500">En línea</span>
                  ) : (
                    <span className="text-zinc-500">Desconectado</span>
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CUERPO DE MENSAJES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-20">
        {loading && messages.length === 0 ? (
          <ChatSkeleton />
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender_id === user.id;
            const showDateDivider = index === 0 || 
              new Date(messages[index - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();

            return (
              <React.Fragment key={msg.id || index}>
                {showDateDivider && (
                  <div className="flex justify-center my-4">
                    <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[11px] px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                      {new Date(msg.created_at).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                  </div>
                )}
                
                <div 
                  className={`flex group ${isMine ? "justify-end" : "justify-start"} mb-3 px-2`}
                  onClick={() => isMobile && isMine && setSelectedMessage(msg)}
                >
                  {/* Botón borrar Desktop */}
                  {!isMobile && isMine && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedMessage(msg); setIsDeleteModalOpen(true); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 p-1 text-zinc-400 hover:text-red-500 self-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[14.5px] shadow-sm ${
                    isMine ? "bg-indigo-600 text-white rounded-br-none" : "bg-zinc-300 dark:bg-zinc-800 dark:text-white rounded-bl-none border dark:border-zinc-700/50"
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${isMine ? "text-indigo-200 justify-end" : "text-zinc-400 justify-start"}`}>
                      {formatMessageTime(msg.created_at)}
                      {isMine && (
                        <span className="ml-1">
                          {msg.is_read ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3"><path d="M2 12l5 5L20 4M7 12l5 5L22 4" /></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}

        {/* INDICADOR TYPING INFERIOR */}
        {isFriendTyping && (
          <div className="flex justify-start animate-pulse mb-2">
            <div className="bg-zinc-200 dark:bg-zinc-800 text-[10px] px-3 py-1.5 rounded-full text-zinc-500 font-medium flex items-center gap-2">
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              {activeChat.full_name} está escribiendo...
            </div>
          </div>
        )}
      </div>

      {/* INPUT DE MENSAJE */}
      <div className="sticky bottom-0 bg-white dark:bg-black p-4 border-t dark:border-zinc-900">
        <InputMessage
          input={newMessage}
          setInput={setNewMessage}
          onSubmit={handleSendMessage}
          sendTypingSignal={sendTypingSignal}
        />
      </div>

      {/* MOBILE ACTION SHEET */}
      {isMobile && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setSelectedMessage(null)} />
          <div className="relative w-full bg-white dark:bg-neutral-900 rounded-t-32px p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6" />
            <div className="space-y-3">
              <button onClick={() => handleCopyMessage(selectedMessage.content)} className="w-full flex items-center gap-4 p-4 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl"><Save size={20} /></div>
                <span className="font-semibold text-[15px]">Copiar texto</span>
              </button>

              {selectedMessage.sender_id === user.id && (
                <button onClick={() => { setIsDeleteModalOpen(true); }} className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 rounded-2xl">
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl"><Trash2 size={20} /></div>
                  <span className="font-semibold text-[15px]">Eliminar para todos</span>
                </button>
              )}
              <button onClick={() => setSelectedMessage(null)} className="w-full p-4 text-zinc-500 font-bold bg-zinc-50 dark:bg-zinc-800 rounded-2xl mt-2">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedMessage(null); }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar mensaje?"
        message="Esta acción eliminará el mensaje para todos. No se puede deshacer."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ChatWindow;