import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/messages/useChat";
import { useMutuals } from "@/hooks/messages/useMutuals";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MutualsList from "./MutualsListv2";
import ChatWindow from "./ChatWindowv4";

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  // Usamos nuestros Custom Hooks
  const { mutuals, onlineUsers, loadingMutuals } = useMutuals(user?.id);
  const { messages, loading, sendMessage } = useChat(user?.id, activeChat?.friend_id);

  // Seteo de ID global para lógica externa si la necesitas
  useEffect(() => {
    window.activeChatFriendId = activeChat?.friend_id || null;
    return () => { window.activeChatFriendId = null; };
  }, [activeChat]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
    setNewMessage("");
  };

  return (
    // <div 
    // className="max-w-2xl mx-auto h-screen flex flex-col bg-white dark:bg-black overflow-hidden"
    // >
    // </div>
    <>
      {!activeChat ? (
        <MutualsList
          mutuals={mutuals}
          onSelectChat={setActiveChat}
          onlineUsers={onlineUsers}
          onBack={() => navigate(-1)}
          loadingMutuals={loadingMutuals}
        />
      ) : (
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          user={user}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSend}
          onBack={() => setActiveChat(null)}
          loading={loading}
          onlineUsers={onlineUsers}
          isMobile={isMobile}
        />
      )}
    </>
  );
};

export default MessagesPage