import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import MutualsList from "./MutualsList";
import ChatWindow from "./ChatWindowv2";
import { useIsMobile } from "@/hooks/useIsMobile";

const MessagesPage = () => {
  const { user } = useAuth();
  const [mutuals, setMutuals] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]); // <--- NUEVO: Guardar mensajes
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Agrega este estado arriba
  const [onlineUsers, setOnlineUsers] = useState({});
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!user) return;

    // Creamos un canal de Presence
    const presenceChannel = supabaseClient.channel("global_presence", {
      config: { presence: { key: user.id } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        // Aquí podrías actualizar el estado de tus mutuals si quisieras
        // ver quién está online en la lista lateral.
        const state = presenceChannel.presenceState();
        setOnlineUsers(state)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // "Track" anuncia mis datos al resto de usuarios
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            user_id: user.id,
          });
        }
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (user) loadMutuals();
  }, [user]);

  const handleSelectChat = (friend) => {
    setActiveChat(friend);

    // 1. Resetear el contador en la UI localmente de forma inmediata
    setMutuals((prev) =>
      prev.map((f) =>
        f.friend_id === friend.friend_id ? { ...f, unread_count: 0 } : f,
      ),
    );
  };

  // Escuchar cambios globales en mensajes para reordenar la lista de amigos
  useEffect(() => {
    const channel = supabaseClient
      .channel("global_messages_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        () => {
          loadMutuals(); // Recargar lista para actualizar previews y orden
        },
      )
      .subscribe();

    return () => supabaseClient.removeChannel(channel);
  }, []);

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
            // 1. Si es un mensaje NUEVO enviado por el amigo a mí
            if (
              payload.eventType === "INSERT" &&
              payload.new.sender_id === activeChat.friend_id &&
              payload.new.receiver_id === user.id
            ) {
              setMessages((prev) => [...prev, payload.new]);
            }

            // Dentro del useEffect de suscripción en MessagesPage.jsx
            if (payload.eventType === "UPDATE") {
              const updatedMsg = payload.new;

              setMessages((prev) =>
                prev.map((m) => {
                  // Si el ID coincide, reemplazamos con el nuevo objeto que ya trae is_read: true
                  if (m.id === updatedMsg.id) {
                    return { ...m, ...updatedMsg };
                  }
                  return m;
                }),
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

    const tempId = Date.now(); // Guardamos el temporal
    const tempMsg = {
      id: tempId,
      sender_id: user.id,
      receiver_id: activeChat.friend_id,
      content: newMessage.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    const { data, error } = await supabaseClient
      .from("direct_messages")
      .insert([
        {
          sender_id: user.id,
          receiver_id: activeChat.friend_id,
          content: tempMsg.content,
        },
      ])
      .select(); // <--- IMPORTANTE: Pedir que devuelva el mensaje insertado

    if (!error && data) {
      // Reemplazamos el mensaje temporal con el real de la DB (que ya tiene el ID correcto)
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data[0] : m)));
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col bg-white dark:bg-zinc-950 border-x dark:border-zinc-900">
      {!activeChat ? (
        <MutualsList mutuals={mutuals} onSelectChat={handleSelectChat} onlineUsers={onlineUsers} />
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
          onlineUsers={onlineUsers}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default MessagesPage;
