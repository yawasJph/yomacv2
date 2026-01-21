// src/hooks/useYawasChat.js
import { useState, useCallback } from "react";
import { getResilientChatResponse } from "../../../service/yawas/yawasApi";


export const useYawasChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  

  const processStream = async (response, placeholderMsg) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
      
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated?.length - 1] = { ...placeholderMsg, text: fullText };
        return updated;
      });
    }
    return fullText;
  };

  const sendMessage = async (payload) => {
    setIsTyping(true);
    try {
      const response = await getResilientChatResponse(payload);
      const placeholderBot = { user_id: user.id, text: "", role: "assistant" };
      
      setMessages(prev => [...prev, placeholderBot]);
      const fullText = await processStream(response, placeholderBot);
      
      return fullText;
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, setMessages, isTyping, sendMessage };
};