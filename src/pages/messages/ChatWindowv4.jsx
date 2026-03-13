import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Trash2,
  Copy,
  MoreHorizontal,
  Check,
  CheckCheck,
} from "lucide-react";
import { notify } from "@/utils/toast/notifyv3";
import ConfirmModal from "@/components/modals/ConfirmModalv2";
import { InputMessage } from "./InputMessage";
import { ChatSkeleton } from "@/components/skeletons/ChatSkeleton";
import { HeaderSkeleton } from "@/components/skeletons/HeaderSkeletonChat";
import { useChat } from "@/hooks/messages/useChatv2";

const ChatWindow = ({ activeChat, user, onBack, onlineUsers, isMobile }) => {
  const scrollRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reactionMessageId, setReactionMessageId] = useState(null);
  const longPressTimer = useRef(null);

  const {
    messages,
    loading,
    isFriendTyping,
    sendTypingSignal,
    sendMessage,
    deleteMessage,
    isDeleting,
    reactToMessage,
  } = useChat(user.id, activeChat.friend_id);

  const isFriendOnline = !!onlineUsers[activeChat.friend_id];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isFriendTyping]);

  const handleSendMessage = () => {
    const cleanMessage = newMessage.trim();
    if (!cleanMessage) return;

    // Forzamos un ID temporal muy distinto a cualquier UUID
    sendMessage(cleanMessage);
    setNewMessage("");
  };

  const handleConfirmDelete = () => {
    if (!selectedMessage) return;
    deleteMessage(selectedMessage.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedMessage(null);
        //notify.success("Mensaje eliminado");
      },
    });
  };

  const handleCopyMessage = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setSelectedMessage(null);
    notify.success("Copiado al portapapeles");
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("es-MX", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateString));
  };

  const handleTouchStart = (msgId) => {
    longPressTimer.current = setTimeout(() => {
      setReactionMessageId(msgId);
      if (window.navigator.vibrate) window.navigator.vibrate(50); // Vibración táctil suave
    }, 500); // 500ms para considerar long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div
      //className="flex flex-col min-h-[700px] bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden"
      className={`flex flex-col min-h-screen bg-white dark:bg-black text-gray-900  dark:text-white transition-colors duration-300`}
    >
      {/* HEADER */}
      <div
        // className="flex justify-between items-center gap-5 p-4 md:px-8 md:py-4 bg-white/80 dark:bg-black/80 backdrop-blur-md z-40 border-b border-gray-200 dark:border-zinc-800  shadow-sm"
        className={`flex items-center gap-5 p-4 md:p-6  backdrop-blur-xl z-40 sticky top-0 border-b border-gray-100 dark:border-neutral-900  bg-white/90 dark:bg-black/90 shadow-sm dark:shadow-gray-900/30 transition-all`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft size={24} className="dark:text-white" />
          </button>

          {loading ? (
            <HeaderSkeleton />
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeChat.avatar || "/default-avatar.png"}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-zinc-800"
                  alt={activeChat.full_name}
                />
                {isFriendOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full" />
                )}
              </div>
              <div>
                <span className="font-bold dark:text-white text-[15px] block leading-tight">
                  {activeChat.full_name}
                </span>
                <span className="text-[11px] font-medium">
                  {isFriendTyping ? (
                    <span className="text-indigo-500 animate-pulse">
                      Escribiendo...
                    </span>
                  ) : isFriendOnline ? (
                    <span className="text-green-500">En línea</span>
                  ) : (
                    <span className="text-zinc-500 font-normal">
                      Desconectado
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHAT BODY */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:py-6 sm:space-y-6 no-scrollbar"
      >
        {/**pb-24 */}
        {loading && messages.length === 0 ? (
          <ChatSkeleton />
        ) : (
          messages.map((msg, index) => {
            //const isMine = msg.sender_id === user.id;
            const isMine = String(msg.sender_id) === String(user.id);
            const isDeleted = !!msg.deleted_at;
            const showDateDivider =
              index === 0 ||
              new Date(messages[index - 1].created_at).toDateString() !==
                new Date(msg.created_at).toDateString();
            const uniqueKey = `${msg.id}-${index}-${msg.sender_id}`;

            return (
              <React.Fragment key={`section-${uniqueKey}`}>
                {showDateDivider && (
                  <div className="flex justify-center my-6">
                    <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 text-[10px] px-4 py-1 rounded-full uppercase font-black tracking-widest border dark:border-zinc-800">
                      {new Date(msg.created_at).toLocaleDateString("es-MX", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                )}

                <div
                  key={`bubble-container-${uniqueKey}`}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"} group relative ${msg.reaction && !isDeleted ? "mb-5" : "mb-1"} `}
                >
                  <div
                    className={`flex items-center max-w-[85%] md:max-w-[70%] gap-2 ${isMine ? "flex-row" : "flex-row-reverse"}`}
                  >
                    {/* DESKTOP ACTIONS (Menu de tres puntos) */}
                    {!isMobile && !isDeleted && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleCopyMessage(msg.content)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                          title="Copiar"
                        >
                          <Copy size={15} />
                        </button>
                        {isMine && (
                          <button
                            onClick={() => {
                              setSelectedMessage(msg);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    )}

                    {/* BURBUJA DE MENSAJE */}
                    <div
                      // EVENTOS TÁCTILES PARA LONG PRESS
                      onTouchStart={() =>
                        !isMine &&
                        isMobile &&
                        !isDeleted &&
                        handleTouchStart(msg.id)
                      }
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchEnd} // Si mueve el dedo, cancelamos
                      // CLICK NORMAL
                      onClick={() => {
                        if (isMobile && !isDeleted) {
                          // Solo abrimos el sheet si no se activó el long press
                          if (reactionMessageId === null) {
                            setSelectedMessage(msg);
                          }
                        }
                      }}
                      onDoubleClick={() =>
                        !isMobile && !isDeleted && reactToMessage(msg.id, "❤️")
                      }
                      className={`relative select-none ${msg.is_optimistic ? "opacity-70 scale-95" : "opacity-100 scale-100"}  px-4 py-2.5 rounded-2xl text-[14px] md:text-[15px] shadow-sm cursor-pointer transition-all active:scale-[0.98] ${
                        isDeleted
                          ? "bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-400 italic"
                          : isMine
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 rounded-bl-none border border-transparent dark:border-zinc-800/50"
                      }`}
                    >
                      {isDeleted ? (
                        <div className="flex items-center gap-2 text-xs py-0.5 opacity-70">
                          <Trash2 size={14} /> <span>Mensaje eliminado</span>
                        </div>
                      ) : (
                        <>
                          <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
                            {msg.content}
                          </p>
                          {/* <p className={`leading-relaxed whitespace-pre-wrap wrap-break-word ${isMine ? "pr-12" : "pr-4"}`}>
                             {msg.content}
                          </p> */}

                          {!isDeleted && (
                            <div
                              className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-zinc-400 font-medium ${isMine ? "justify-end" : "justify-start"}`}
                            >
                              {formatMessageTime(msg.created_at)}
                              {isMine &&
                                (msg.is_read ? (
                                  <CheckCheck
                                    size={13}
                                    className="text-cyan-500"
                                  />
                                ) : (
                                  <Check size={13} />
                                ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* SELECTOR DE EMOJIS - UI Mejorada */}
                  {reactionMessageId === msg.id && !isDeleted && (
                    <div
                      //  className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-full shadow-2xl z-50 animate-in fade-in zoom-in slide-in-from-bottom-3 duration-200 ring-1 ring-black/5"
                      className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-full shadow-2xl z-50 animate-in fade-in zoom-in slide-in-from-bottom-3 duration-200 ring-1 ring-black/5"
                    >
                      {["❤️", "😂", "😮", "🔥", "😢", "👍"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newEmoji =
                              msg.reaction === emoji ? null : emoji;
                            reactToMessage(msg.id, newEmoji);
                            setReactionMessageId(null);
                          }}
                          className="w-10 h-10 flex items-center justify-center text-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                      {/* <div
                        className="fixed inset-0 z-40"
                        onClick={() => setReactionMessageId(null)}
                      /> */}
                    </div>
                  )}

                  {/* EMOJI DE REACCIÓN */}
                  {/* EMOJI DE REACCIÓN: Posicionado estratégicamente */}
                  {msg.reaction && !isDeleted && (
                    <div
                      className={`absolute -bottom-3 
                        ${isMine ? "-right-2" : "-left-2"} 
                           g-white dark:bg-zinc-800 border dark:border-zinc-700 
                           rounded-full px-1.5 py-0.5 text-[11px] shadow-md 
                           z-20 animate-in zoom-in duration-300`}
                    >
                      {msg.reaction}
                    </div>
                  )}
                </div>
                {reactionMessageId && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setReactionMessageId(null)}
                  />
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      <InputMessage
        input={newMessage}
        setInput={setNewMessage}
        onSubmit={handleSendMessage}
        sendTypingSignal={sendTypingSignal}
      />

      {/* INPUT */}
      {/* <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 border-t dark:border-zinc-800 z-30">
       
      </div> */}

      {/* MOBILE ACTION SHEET (Ahora para todos los mensajes no eliminados) */}
      {isMobile && selectedMessage && (
        <div className="fixed inset-0 z-100 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedMessage(null)}
          />
          <div className="relative w-full bg-white dark:bg-zinc-950 rounded-t-4xl p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300 ring-1 ring-black/5 dark:ring-white/10">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8" />

            <div className="space-y-2">
              <button
                onClick={() => handleCopyMessage(selectedMessage.content)}
                className="w-full flex items-center gap-4 p-4 text-zinc-700 dark:text-zinc-200 active:bg-zinc-100 dark:active:bg-zinc-900 rounded-2xl transition-colors"
              >
                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-indigo-500">
                  <Copy size={20} />
                </div>
                <span className="font-bold text-[16px]">Copiar mensaje</span>
              </button>

              {selectedMessage.sender_id === user.id && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full flex items-center gap-4 p-4 text-red-500 active:bg-red-50 dark:active:bg-red-500/10 rounded-2xl transition-colors"
                >
                  <div className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <Trash2 size={20} />
                  </div>
                  <span className="font-bold text-[16px]">
                    Eliminar para todos
                  </span>
                </button>
              )}

              <button
                onClick={() => setSelectedMessage(null)}
                className="w-full p-4 text-zinc-400 font-bold mt-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMessage(null);
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar para todos?"
        message="El contenido del mensaje será reemplazado por un aviso de eliminación."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ChatWindow;
