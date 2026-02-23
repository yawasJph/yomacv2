import React, { useEffect, useRef } from "react";
import { ChevronLeft, Send, MoreVertical } from "lucide-react";

const ChatWindow = ({
  activeChat,
  messages,
  user,
  newMessage,
  setNewMessage,
  onSendMessage,
  onBack,
  loading,
}) => {
  const scrollRef = useRef(null);

  // EFECTO: Scroll automático al final cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

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
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* HEADER DEL CHAT */}
      <div className="p-4 border-b dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950 sticky top-0 z-20 shadow-sm">
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
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full"></div>
          </div>
          <div>
            <span className="font-bold dark:text-white text-sm block leading-none">
              {activeChat.full_name}
            </span>
            <span className="text-[10px] text-green-500 font-medium">
              En línea
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* INPUT DE MENSAJE */}
      <form
        onSubmit={onSendMessage}
        className="p-4 border-t dark:border-zinc-900 flex gap-2 bg-white dark:bg-zinc-950"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm outline-none"
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="bg-indigo-600 p-3 rounded-2xl text-white disabled:opacity-30 disabled:grayscale transition-all hover:bg-indigo-700 active:scale-95"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
