import React, { useEffect, useRef } from "react";
import { ChevronLeft, Send, MoreVertical } from "lucide-react";
import { supabaseClient } from "@/supabase/supabaseClient";

const ChatWindow = ({
  activeChat,
  messages,
  user,
  newMessage,
  setNewMessage,
  onSendMessage,
  onBack,
  loading,
  onlineUsers,
  isMobile,
}) => {
  const scrollRef = useRef(null);
  const [isFriendTyping, setIsFriendTyping] = React.useState(false);

  // 1. Nombre de canal ÚNICO y COMPARTIDO (Sorted IDs)
  const typingChannelName = `typing_${[user.id, activeChat.friend_id].sort().join("_")}`;

  //online user
  const isFriendOnline = !!onlineUsers[activeChat.friend_id];

  useEffect(() => {
    const channel = supabaseClient.channel(typingChannelName);

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        // Si el que escribe es mi amigo
        if (payload.userId === activeChat.friend_id) {
          setIsFriendTyping(true);

          // Resetear el temporizador si el amigo sigue pulsando teclas
          if (window.typingUIDisplayTimeout)
            clearTimeout(window.typingUIDisplayTimeout);

          window.typingUIDisplayTimeout = setTimeout(() => {
            setIsFriendTyping(false);
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
      if (window.typingUIDisplayTimeout)
        clearTimeout(window.typingUIDisplayTimeout);
    };
  }, [activeChat.friend_id]); // Importante: se reinicia al cambiar de chat

  // 2. Función para notificar que YO escribo
  const sendTypingSignal = () => {
    if (window.typingPublishTimeout) return;

    const channel = supabaseClient.channel(typingChannelName);
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id },
    });

    // Limitamos a un envío cada 2 segundos para no saturar el tráfico
    window.typingPublishTimeout = setTimeout(() => {
      window.typingPublishTimeout = null;
    }, 2000);
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("es-MX", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const markAsRead = async () => {
    if (!activeChat || !user) return;

    const { error } = await supabaseClient
      .from("direct_messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("sender_id", activeChat.friend_id) // Mensajes que él me envió
      .eq("receiver_id", user.id) // ... a mí
      .eq("is_read", false); // Solo los que no están leídos

    if (error) console.error("Error marcando como leído:", error.message);
  };

  // Ejecutar cuando se abre el chat o cuando llegan nuevos mensajes
  useEffect(() => {
    if (activeChat && user) {
      markAsRead();
    }
  }, [activeChat.friend_id]); // Se dispara siempre que cambies de amigo

  // También cuando llegan mensajes nuevos mientras estás dentro
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    // Si el último mensaje es del amigo (no mío) y no está leído
    if (
      lastMessage &&
      lastMessage.sender_id === activeChat.friend_id &&
      !lastMessage.is_read
    ) {
      markAsRead();
    }
  }, [messages]);

  // EFECTO: Scroll automático al final cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isFriendTyping]);



  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black bg-linear-to-br from-white via-gray-50 to-white text-gray-900 dark:bg-linear-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 dark:text-white transition-colors duration-300">
      {/* ... Header del Chat ... */}
      {/* HEADER DEL CHAT */}
      <div
        className={`flex justify-between items-center gap-5 p-4 md:p-6 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl z-40 border-b border-gray-100 dark:border-neutral-900 ${
          isMobile ? "sticky top-16 z-10 px-3" : "sticky top-15 z-10 px-3"
        } bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-gray-900/30 transition-all`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            <ChevronLeft className="dark:text-white" />
          </button>
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
            <span className="font-bold dark:text-white text-sm block leading-none">
              {activeChat.full_name}
            </span>
            <span className="text-[10px] font-medium transition-colors">
              <span className="text-[10px] font-medium transition-colors">
                {isFriendTyping ? (
                  <span className="text-indigo-500 animate-pulse">
                    Escribiendo...
                  </span>
                ) : isFriendOnline ? (
                  <span className="text-green-500">En línea</span>
                ) : (
                  <span className="text-zinc-500">Desconectado</span>
                )}
              </span>
            </span>
          </div>
        </div>
        <button className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* CUERPO DE MENSAJES */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
      >
        {messages.map((msg, index) => {
          //const isMine = msg.sender_id === user.id;
          const isMine = msg.sender_id === user.id;
          const showDateDivider =
            index === 0 ||
            new Date(messages[index - 1].created_at).toDateString() !==
              new Date(msg.created_at).toDateString();
          return (
            <React.Fragment key={msg.id}>
              {showDateDivider && (
                <div className="flex justify-center my-4">
                  <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[11px] px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                    {new Date(msg.created_at).toLocaleDateString(undefined, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              )}
              <div
                key={msg.id || index}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[14.5px] shadow-sm ${
                    isMine
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white dark:bg-zinc-800 dark:text-white rounded-bl-none border dark:border-zinc-700/50"
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>

                  <div
                    className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                      isMine
                        ? "text-indigo-200 justify-end"
                        : "text-zinc-400 justify-start"
                    }`}
                  >
                    {formatMessageTime(msg.created_at)}

                    {/* Icono de check (opcional por ahora, estático) */}
                    {isMine && (
                      <span className="ml-1">
                        {msg.is_read ? (
                          // Doble check azul (Leído)
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#34D399"
                            strokeWidth="3"
                          >
                            <path d="M2 12l5 5L20 4M7 12l5 5L22 4" />
                          </svg>
                        ) : (
                          // Check simple (Enviado)
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* INDICADOR DE TYPING */}
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
      <form
        onSubmit={onSendMessage}
        className="p-4 border-t dark:border-zinc-900 flex gap-2 bg-white dark:bg-zinc-950"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            sendTypingSignal(); // <--- Se activa aquí para mayor precisión
          }}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm outline-none"
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="bg-indigo-600 p-3 rounded-2xl text-white"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
