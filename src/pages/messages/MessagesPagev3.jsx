import { useAuth } from "@/context/AuthContext";
import { useMutuals } from "@/hooks/messages/useMutuals";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MutualsList from "./MutualsListv2";
import ChatWindow from "./ChatWindowv4";

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeChat, setActiveChat] = useState(null);

  // 1. Cargamos mutuals a nivel superior porque la lista siempre es visible al inicio
  const { mutuals, onlineUsers, loadingMutuals } = useMutuals(user?.id);

  // 2. Seteo de ID global (Usa useRef si es posible, pero mantenemos tu lógica)
  useEffect(() => {
    window.activeChatFriendId = activeChat?.friend_id || null;
    return () => { window.activeChatFriendId = null; };
  }, [activeChat]);

  // 3. Memorizar funciones para evitar recrearlas en cada render
  const handleSelectChat = useCallback((chat) => {
    setActiveChat(chat);
  }, []);

  const handleBack = useCallback(() => {
    if (activeChat) {
      setActiveChat(null);
    } else {
      navigate(-1);
    }
  }, [activeChat, navigate]);

  // 4. Optimizamos la renderización condicional
  return (
    <>
      {!activeChat ? (
        <MutualsList
          mutuals={mutuals}
          onSelectChat={handleSelectChat}
          onlineUsers={onlineUsers}
          onBack={handleBack}
          loadingMutuals={loadingMutuals}
        />
      ) : (
        <ChatWindow
          activeChat={activeChat}
          user={user}
          onBack={handleBack}
          onlineUsers={onlineUsers}
          isMobile={isMobile}
        />
      )}
    </>
  );
};

export default MessagesPage;