// src/features/campusAI/hooks/useChatMessages.js
import { useState } from "react";
import { supabaseClient } from "../../../supabase/supabaseClient";

export const useChatMessages = (userId) => {
  const [messages, setMessages] = useState([]);

  const fetchChatHistory = async () => {
    if (!userId) return [];
    
    const { data } = await supabaseClient
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (data) {
      setMessages(data);
      return data;
    }
    return [];
  };

  const addMessage = async (message) => {
    setMessages(prev => [...prev, message]);
    
    const { data } = await supabaseClient
      .from("chat_messages")
      .insert(message)
      .select()
      .single();
    
    return data;
  };

  const updateLastMessage = (updater) => {
    setMessages(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = typeof updater === 'function' 
        ? updater(updated[lastIndex]) 
        : { ...updated[lastIndex], ...updater };
      return updated;
    });
  };

  return {
    messages,
    setMessages,
    fetchChatHistory,
    addMessage,
    updateLastMessage
  };
};