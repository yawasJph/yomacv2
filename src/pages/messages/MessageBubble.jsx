import { Check, CheckCheck } from "lucide-react";
import React from "react";

// 1. Extraemos lógica de utilidad fuera para evitar re-definiciones
const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric", minute: "numeric", hour12: true,
  }).format(new Date(dateString));
};


const MessageBubble = React.memo(({ msg, isMine, isMobile, onReaction, onSelect, onCopy, showDateDivider }) => {
  const isDeleted = !!msg.deleted_at;
  
  return (
    <>
      {showDateDivider && (
        <div className="flex justify-center my-6">
          <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] px-4 py-1 rounded-full uppercase font-black tracking-widest border dark:border-zinc-800">
            {new Date(msg.created_at).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>
      )}

      <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} group relative mb-2`}>
        <div 
          onClick={() => !isDeleted && onSelect()}
          onDoubleClick={() => !isDeleted && !isMobile && onReaction(msg.id, "❤️")}
          className={`relative max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] transition-all active:scale-[0.98] ${
            isDeleted ? "border border-zinc-200 dark:border-zinc-800 text-zinc-400 italic" :
            isMine ? "bg-indigo-600 text-white rounded-br-none" : "bg-zinc-100 dark:bg-zinc-900 rounded-bl-none"
          }`}
        >
          {isDeleted ? "Mensaje eliminado" : msg.content}
          {!isDeleted && (
            <div className={`flex items-center gap-1.5 mt-1 text-[10px] opacity-70 ${isMine ? "justify-end" : "justify-start"}`}>
              {formatMessageTime(msg.created_at)}
              {isMine && (msg.is_read ? <CheckCheck size={13} className="text-cyan-400" /> : <Check size={13} />)}
            </div>
          )}
          {msg.reaction && !isDeleted && (
            <div className={`absolute -bottom-3 ${isMine ? "-right-2" : "-left-2"} bg-white dark:bg-zinc-800 rounded-full px-1.5 shadow-md text-[11px] animate-in zoom-in`}>
              {msg.reaction}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default MessageBubble