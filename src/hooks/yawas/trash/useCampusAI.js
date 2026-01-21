// src/features/campusAI/hooks/useCampusAI.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChatMessages } from "../useChatMessages";
import { useUserProfile } from "../useUserProfile";
import { useYawasAPI } from "./useYawasAPI";
import { useAuth } from "../../../context/AuthContext";

export const useCampusAI = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const { userProfile, fetchUserProfile, updateUserNotes } = useUserProfile(user?.id);
  const { messages, setMessages, fetchChatHistory, addMessage, updateLastMessage } = useChatMessages(user?.id);
  const { sendMessageToYawas, triggerWelcomeGreeting } = useYawasAPI({
    userProfile,
    setIsTyping,
    addMessage,
    updateLastMessage,
    updateUserNotes
  });

  // Inicialización
  useEffect(() => {
    const initChat = async () => {
      if (user?.id) {
        const profile = await fetchUserProfile();
        const history = await fetchChatHistory();

        if (history.length === 0 && profile) {
          await triggerWelcomeGreeting(profile, setMessages);
        }
      }
    };
    initChat();
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImagePreview = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const hasText = input.trim().length > 0;
    const hasImage = imageFile !== null;
    if (!hasText && !hasImage) return;

    const userText = input;
    const currentImageFile = imageFile;
    
    setInput("");
    clearImagePreview();

    await sendMessageToYawas(userText, currentImageFile, messages);
  };

  return {
    // State
    messages,
    input,
    setInput,
    imageFile,
    previewUrl,
    isTyping,
    scrollRef,
    userProfile,
    
    // Actions
    handleSendMessage,
    handleFileChange,
    clearImagePreview,
    navigate
  };
};