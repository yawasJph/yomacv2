import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  Trash2,
  Copy,
  MoreHorizontal,
  Check,
  CheckCheck,
  ShieldAlert,
  User,
} from "lucide-react";
import { notify } from "@/utils/toast/notifyv3";
import ConfirmModal from "@/components/modals/ConfirmModalv2";
import { InputMessage } from "./InputMessage";
import { ChatSkeleton } from "@/components/skeletons/ChatSkeleton";
import { HeaderSkeleton } from "@/components/skeletons/HeaderSkeletonChat";
import { useChat } from "@/hooks/messages/useChatv2";
import { useNavigate } from "react-router-dom";
import { useFollow } from "@/context/FollowContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { optimizeMedia } from "@/cloudinary/optimizeMedia";

// ─── Constantes fuera del componente para evitar recreación ───────────────────
const EMOJIS = ["❤️", "😂", "😮", "🔥", "😢", "👍"];
const LONG_PRESS_DELAY = 500;
const DATE_FORMAT_OPTIONS = { hour: "numeric", minute: "numeric", hour12: true };
const DATE_LOCALE = "es-MX";

// ─── Formateador reutilizable (instancia única) ───────────────────────────────
const timeFormatter = new Intl.DateTimeFormat(DATE_LOCALE, DATE_FORMAT_OPTIONS);
const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  return timeFormatter.format(new Date(dateString));
};

// ─── Subcomponente: Indicador de estado del amigo ────────────────────────────
const FriendStatus = React.memo(({ isFriendTyping, isFriendOnline }) => {
  if (isFriendTyping)
    return <span className="text-indigo-500 animate-pulse">Escribiendo...</span>;
  if (isFriendOnline)
    return <span className="text-green-500">En línea</span>;
  return <span className="text-zinc-500 font-normal">Desconectado</span>;
});
FriendStatus.displayName = "FriendStatus";

// ─── Subcomponente: Header del chat ──────────────────────────────────────────
const ChatHeader = React.memo(({
  loading,
  activeChat,
  isFriendOnline,
  isFriendTyping,
  showMenu,
  onBack,
  onToggleMenu,
  isMobile,
  goToProfile,
  setIsBlockConfirmOpen,
  unFollowLoading,
}) => (
  <div className="flex items-center gap-5 p-4 md:p-6 backdrop-blur-xl z-40 sticky top-0 border-b border-gray-100 dark:border-neutral-900 bg-white/90 dark:bg-black/90 shadow-sm dark:shadow-gray-900/30 transition-all">
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all active:scale-90"
        aria-label="Volver"
      >
        <ChevronLeft size={24} className="dark:text-white" />
      </button>

      {loading ? (
        <HeaderSkeleton />
      ) : (
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={optimizeMedia(activeChat.avatar,"image") || "/default-avatar.png"}
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
              <FriendStatus isFriendTyping={isFriendTyping} isFriendOnline={isFriendOnline} />
            </span>
          </div>
        </div>
      )}
    </div>

    {/* Botón más opciones */}
    <div className="relative ml-auto">
      <button
        onClick={onToggleMenu}
        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all active:scale-95 text-zinc-400"
        aria-label="Más opciones"
        aria-expanded={showMenu}
      >
        <MoreHorizontal size={22} />
      </button>

      {!isMobile && showMenu && (
        <div className="absolute top-12 right-0 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-2 z-60 animate-in fade-in zoom-in-95 origin-top-right">
          <MenuContent
            goToProfile={goToProfile}
            mutualId={activeChat.friend_id}
            setShowMenu={onToggleMenu}
            setIsBlockConfirmOpen={setIsBlockConfirmOpen}
            unFollowLoading={unFollowLoading}
          />
        </div>
      )}
    </div>
  </div>
));
ChatHeader.displayName = "ChatHeader";

// ─── Subcomponente: Burbuja de mensaje ───────────────────────────────────────
const MessageBubble = React.memo(({
  msg,
  isMine,
  isDeleted,
  isMobile,
  reactionMessageId,
  onCopy,
  onDeleteRequest,
  onTouchStart,
  onTouchEnd,
  onClick,
  onDoubleClick,
  onReact,
  onCloseReaction,
}) => (
  <div
    className={`flex flex-col ${isMine ? "items-end" : "items-start"} group relative ${
      msg.reaction && !isDeleted ? "mb-5" : "mb-1"
    }`}
  >
    <div
      className={`flex items-center max-w-[85%] md:max-w-[70%] gap-2 ${
        isMine ? "flex-row" : "flex-row-reverse"
      }`}
    >
      {/* Acciones desktop */}
      {!isMobile && !isDeleted && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={() => onCopy(msg.content)}
            className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            title="Copiar"
          >
            <Copy size={15} />
          </button>
          {isMine && (
            <button
              onClick={() => onDeleteRequest(msg)}
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}

      {/* Burbuja */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchEnd}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={`relative select-none px-4 py-2.5 rounded-2xl text-[14px] md:text-[15px] shadow-sm cursor-pointer transition-all active:scale-[0.98] ${
          msg.is_optimistic ? "opacity-70 scale-95" : "opacity-100 scale-100"
        } ${
          isDeleted
            ? "bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-400 italic"
            : isMine
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 rounded-bl-none border border-transparent dark:border-zinc-800/50"
        }`}
      >
        {isDeleted ? (
          <div className="flex items-center gap-2 text-xs py-0.5 opacity-70">
            <Trash2 size={14} />
            <span>Mensaje eliminado</span>
          </div>
        ) : (
          <>
            <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
              {msg.content}
            </p>
            <div
              className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-zinc-400 font-medium ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              {formatMessageTime(msg.created_at)}
              {isMine &&
                (msg.is_read ? (
                  <CheckCheck size={13} className="text-cyan-500" />
                ) : (
                  <Check size={13} />
                ))}
            </div>
          </>
        )}
      </div>
    </div>

    {/* Selector de emojis */}
    {reactionMessageId === msg.id && !isDeleted && (
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-full shadow-2xl z-50 animate-in fade-in zoom-in slide-in-from-bottom-3 duration-200 ring-1 ring-black/5">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={(e) => {
              e.stopPropagation();
              onReact(msg.id, msg.reaction === emoji ? null : emoji);
            }}
            className="w-10 h-10 flex items-center justify-center text-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
    )}

    {/* Reacción del mensaje */}
    {msg.reaction && !isDeleted && (
      <div
        className={`absolute -bottom-3 ${
          isMine ? "-right-2" : "-left-2"
        } bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-full px-1.5 py-0.5 text-[11px] shadow-md z-20 animate-in zoom-in duration-300`}
      >
        {msg.reaction}
      </div>
    )}
  </div>
));
MessageBubble.displayName = "MessageBubble";

// ─── Subcomponente: Divider de fecha ─────────────────────────────────────────
const DateDivider = React.memo(({ date }) => (
  <div className="flex justify-center my-6">
    <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 text-[10px] px-4 py-1 rounded-full uppercase font-black tracking-widest border dark:border-zinc-800">
      {new Date(date).toLocaleDateString(DATE_LOCALE, {
        weekday: "short",
        day: "numeric",
        month: "short",
      })}
    </span>
  </div>
));
DateDivider.displayName = "DateDivider";

// ─── Subcomponente: Menú de opciones ─────────────────────────────────────────
const MenuContent = React.memo(({
  goToProfile,
  mutualId,
  setShowMenu,
  setIsBlockConfirmOpen,
  unFollowLoading,
}) => (
  <div className="space-y-1">
    <button
      onClick={() => {
        goToProfile(mutualId);
        setShowMenu(false);
      }}
      className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-xl transition-colors text-zinc-700 dark:text-zinc-200"
    >
      <User size={18} className="text-zinc-400" />
      <span className="font-semibold text-sm">Ver perfil</span>
    </button>

    <button
      onClick={() => {
        setShowMenu(false);
        setIsBlockConfirmOpen(true);
      }}
      disabled={unFollowLoading}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
        unFollowLoading
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
      }`}
    >
      <ShieldAlert size={18} />
      <span className="font-semibold text-sm">
        {unFollowLoading ? "Bloqueando..." : "Bloquear usuario"}
      </span>
    </button>
  </div>
));
MenuContent.displayName = "MenuContent";

// ─── Componente principal ─────────────────────────────────────────────────────
const ChatWindow = ({ activeChat, user, onBack, onlineUsers, isMobile }) => {
  const scrollRef = useRef(null);
  const longPressTimer = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reactionMessageId, setReactionMessageId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);

  const { unfollowUser, loading: unFollowLoading } = useFollow();
  const { data: mutuals } = useQuery({ queryKey: ["mutuals", user.id] });

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

  const isFriendOnline = useMemo(
    () => !!onlineUsers[activeChat.friend_id],
    [onlineUsers, activeChat.friend_id]
  );

  // Scroll al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Verificar si el mutual sigue activo
  useEffect(() => {
    if (loading || !mutuals) return;
    const stillMutual = mutuals.some((m) => m.friend_id === activeChat.friend_id);
    if (!stillMutual) {
      notify.error("Esta conversación ya no está disponible");
      onBack();
    }
  }, [mutuals, activeChat.friend_id, loading, onBack]);

  // ── Handlers memorizados ──────────────────────────────────────────────────
  const goToProfile = useCallback((id) => navigate(`/profile/${id}`), [navigate]);

  const handleSendMessage = useCallback(() => {
    const cleanMessage = newMessage.trim();
    if (!cleanMessage) return;
    sendMessage(cleanMessage);
    setNewMessage("");
  }, [newMessage, sendMessage]);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedMessage) return;
    deleteMessage(selectedMessage.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedMessage(null);
      },
    });
  }, [selectedMessage, deleteMessage]);

  const handleCopyMessage = useCallback((text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setSelectedMessage(null);
    notify.success("Copiado al portapapeles");
  }, []);

  const handleDeleteRequest = useCallback((msg) => {
    setSelectedMessage(msg);
    setIsDeleteModalOpen(true);
  }, []);

  const handleToggleMenu = useCallback(() => setShowMenu((prev) => !prev), []);

  const handleTouchStart = useCallback((msgId) => {
    longPressTimer.current = setTimeout(() => {
      setReactionMessageId(msgId);
      window.navigator.vibrate?.(50);
    }, LONG_PRESS_DELAY);
  }, []);

  const handleTouchEnd = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  const handleReact = useCallback(
    (msgId, emoji) => {
      reactToMessage(msgId, emoji);
      setReactionMessageId(null);
    },
    [reactToMessage]
  );

  const handleBlockUser = useCallback(async (targetUserId) => {
    try {
      await unfollowUser(targetUserId);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["mutuals"] });
      queryClient.invalidateQueries({ queryKey: ["user_suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      setIsBlockConfirmOpen(false);
      onBack();
      notify.success("Usuario bloqueado y eliminado de tus mutuals");
    } catch {
      notify.error("No se pudo completar la acción");
    }
  }, [unfollowUser, queryClient, onBack]);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedMessage(null);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <ChatHeader
        loading={loading}
        activeChat={activeChat}
        isFriendOnline={isFriendOnline}
        isFriendTyping={isFriendTyping}
        showMenu={showMenu}
        onBack={onBack}
        onToggleMenu={handleToggleMenu}
        isMobile={isMobile}
        goToProfile={goToProfile}
        setIsBlockConfirmOpen={setIsBlockConfirmOpen}
        unFollowLoading={unFollowLoading}
      />

      {/* CHAT BODY */}
      <div className="flex-1 overflow-y-auto px-4 sm:py-6 sm:space-y-6 no-scrollbar">
        {loading && messages.length === 0 ? (
          <ChatSkeleton />
        ) : (
          messages.map((msg, index) => {
            const isMine = String(msg.sender_id) === String(user.id);
            const isDeleted = !!msg.deleted_at;
            const prevMsg = messages[index - 1];
            const showDateDivider =
              index === 0 ||
              new Date(prevMsg.created_at).toDateString() !==
                new Date(msg.created_at).toDateString();
            const uniqueKey = `${msg.id}-${index}-${msg.sender_id}`;

            return (
              <React.Fragment key={`section-${uniqueKey}`}>
                {showDateDivider && <DateDivider date={msg.created_at} />}

                <MessageBubble
                  msg={msg}
                  isMine={isMine}
                  isDeleted={isDeleted}
                  isMobile={isMobile}
                  reactionMessageId={reactionMessageId}
                  onCopy={handleCopyMessage}
                  onDeleteRequest={handleDeleteRequest}
                  onTouchStart={
                    !isMine && isMobile && !isDeleted
                      ? () => handleTouchStart(msg.id)
                      : undefined
                  }
                  onTouchEnd={handleTouchEnd}
                  onClick={
                    isMobile && !isDeleted
                      ? () => {
                          if (reactionMessageId === null) setSelectedMessage(msg);
                        }
                      : undefined
                  }
                  onDoubleClick={
                    !isMobile && !isDeleted
                      ? () => reactToMessage(msg.id, "❤️")
                      : undefined
                  }
                  onReact={handleReact}
                  onCloseReaction={() => setReactionMessageId(null)}
                />

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
        <div ref={scrollRef} />
      </div>

      <InputMessage
        input={newMessage}
        setInput={setNewMessage}
        onSubmit={handleSendMessage}
        sendTypingSignal={sendTypingSignal}
      />

      {/* Mobile: Action Sheet del mensaje */}
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
                  <span className="font-bold text-[16px]">Eliminar para todos</span>
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

      {/* Mobile: Sheet del menú de opciones */}
      {isMobile && showMenu && (
        <div className="fixed inset-0 z-100 flex items-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          <div className="relative w-full bg-white dark:bg-zinc-950 rounded-t-4xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6" />
            <MenuContent
              goToProfile={goToProfile}
              mutualId={activeChat.friend_id}
              setShowMenu={setShowMenu}
              setIsBlockConfirmOpen={setIsBlockConfirmOpen}
              unFollowLoading={unFollowLoading}
            />
            <button
              onClick={() => setShowMenu(false)}
              className="w-full mt-4 p-2 text-zinc-400 font-bold text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar para todos?"
        message="El contenido del mensaje será reemplazado por un aviso de eliminación."
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={isBlockConfirmOpen}
        onClose={() => setIsBlockConfirmOpen(false)}
        onConfirm={() => handleBlockUser(activeChat.friend_id)}
        title="¿Bloquear a este usuario?"
        message="Se borrará de tu lista de seguidos."
        isLoading={unFollowLoading}
      />
    </div>
  );
};

export default ChatWindow;
