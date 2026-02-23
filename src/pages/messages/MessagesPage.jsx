import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import MutualsList from "./MutualsList";
import ChatWindow from "./ChatWindow";

const MessagesPage = () => {
  const { user } = useAuth();
  const [mutuals, setMutuals] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]); // <--- NUEVO: Guardar mensajes
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) loadMutuals();
  }, [user]);

  const handleSelectChat = (friend) => {
  setActiveChat(friend);
  // Limpiamos el contador localmente para feedback instantáneo
  setMutuals(prev => prev.map(f => 
    f.friend_id === friend.friend_id ? { ...f, unreadCount: 0 } : f
  ));
};

  // Cargar mensajes y suscripción Real-time
  useEffect(() => {
    if (activeChat) {
      fetchMessages();

      // Suscripción de Supabase para recibir mensajes nuevos del otro
      const channel = supabaseClient
        .channel(`room_${activeChat.friend_id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "direct_messages",
           // filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            
            if (
              payload.eventType === "INSERT" &&
              payload.new.sender_id === activeChat.friend_id
            ) {
              setMessages((prev) => [...prev, payload.new]);
              loadMutuals()
            }
            if (payload.eventType === "UPDATE") {
              // Si un mensaje se actualizó a is_read = true, actualizamos el estado local
              setMessages((prev) =>
                prev.map((m) => (m.id === payload.new.id ? payload.new : m)),
              );
            }
          },
        )
        .subscribe();

      return () => supabaseClient.removeChannel(channel);
    }
  }, [activeChat]);

  const loadMutuals = async () => {
    const { data, error } = await supabaseClient.rpc(
      "get_mutual_followers_with_unread",
      {
        p_user_id: user.id, // Asegúrate de usar el nombre del parámetro p_user_id
      },
    );

    if (!error) {
      setMutuals(data);
    } else {
      console.error("Error al cargar mutuals:", error.message);
    }
  };

  // CONSULTA FILTRADA POR CONVERSACIÓN
  const fetchMessages = async () => {
    const { data, error } = await supabaseClient
      .from("direct_messages")
      .select("*")
      // Filtramos: (Yo envié y él recibe) O (Él envió y yo recibo)
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.friend_id}),and(sender_id.eq.${activeChat.friend_id},receiver_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true });

    if (!error) setMessages(data);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    // Optimistic Update: Añadir el mensaje a la UI antes de que llegue a la DB
    const tempMsg = {
      id: Date.now(),
      sender_id: user.id,
      content: newMessage.trim(),
    };
    setMessages([...messages, tempMsg]);
    setNewMessage("");

    const { error } = await supabaseClient.from("direct_messages").insert([
      {
        sender_id: user.id,
        receiver_id: activeChat.friend_id,
        content: tempMsg.content,
      },
    ]);

    if (error) console.error(error);
  };

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col bg-white dark:bg-zinc-950 border-x dark:border-zinc-900">
      {!activeChat ? (
        <MutualsList mutuals={mutuals} onSelectChat={handleSelectChat} />
      ) : (
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          user={user}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onBack={() => setActiveChat(null)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default MessagesPage;
