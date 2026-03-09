import { useState, useEffect } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";

export const useChat = (userId, activeFriendId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar mensajes iniciales
  const fetchMessages = async () => {
    if (!activeFriendId) return;
    setLoading(true);
    const { data } = await supabaseClient
      .from("direct_messages")
      .select("*")
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${activeFriendId}),and(sender_id.eq.${activeFriendId},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    if (!activeFriendId) return;
    const channel = supabaseClient
      .channel(`room_${activeFriendId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, (payload) => {
        // Lógica de INSERT del amigo
        if (payload.eventType === "INSERT" && payload.new.sender_id === activeFriendId) {
          setMessages(prev => [...prev, payload.new]);
        }
        // Lógica de UPDATE (is_read)
        if (payload.eventType === "UPDATE") {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }
        // Lógica de DELETE
        if (payload.eventType === "DELETE") {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => supabaseClient.removeChannel(channel);
  }, [activeFriendId, userId]);

  const sendMessage = async (content) => {
    const tempId = Date.now();
    const tempMsg = { id: tempId, sender_id: userId, receiver_id: activeFriendId, content, created_at: new Date().toISOString() };
    
    setMessages(prev => [...prev, tempMsg]);

    const { data, error } = await supabaseClient
      .from("direct_messages")
      .insert([{ sender_id: userId, receiver_id: activeFriendId, content }])
      .select();

    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data[0] : m));
    }
  };

  return { messages, loading, sendMessage, setMessages };
};