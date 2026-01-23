import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";
//import { useYawasChat } from "../../hooks/yawas/useYawasChat";
import { TypingIndicator } from "../../components/yawas/TypingIndicator ";
import { MessageItem } from "../../components/yawas/MessageItem";
import { EmptyState } from "../../components/yawas/EmptyState ";
import { ChatHeader } from "../../components/yawas/ChatHeader";
import {ChatInput2} from "../../components/yawas/InputPro";
import { useYawasChat } from "../../hooks/yawas/useYawasChat2";

const CampusAI = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const scrollRef = useRef(null);

  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { messages, isTyping, sendMessage } = useYawasChat(user?.id);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Manejador de cambio de archivo optimizado
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  // Manejador para remover imagen optimizado
  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setPreviewUrl(null);
  }, []);

  // Manejador de envío de mensaje optimizado
  const handleSendMessage = useCallback(async () => {
    const hasText = input.trim().length > 0;
    const hasImage = imageFile !== null;

    if (!hasText && !hasImage) return;

    const currentInput = input;
    const currentImageFile = imageFile;

    // Limpiar UI inmediatamente
    setInput("");
    setImageFile(null);
    setPreviewUrl(null);

    // Enviar mensaje
    await sendMessage(currentInput, currentImageFile);
  }, [input, imageFile, sendMessage]);

  // Manejador de acción rápida optimizado
  const handleQuickAction = useCallback((action) => {
    setInput(action);
  }, []);

  // Memoizar el contenido de los mensajes
  const messageList = useMemo(() => {
    return messages.map((message, index) => (
      <MessageItem key={`${message.id || index}`} message={message} index={index} />
    ));
  }, [messages]);

  // Memoizar el estado vacío
  const emptyState = useMemo(() => {
    return messages.length === 0 ? (
      <EmptyState onQuickAction={handleQuickAction} />
    ) : null;
  }, [messages.length, handleQuickAction]);

  return (
    <div className={`flex flex-col min-h-screen bg-white dark:bg-black bg-linear-to-br from-white via-gray-50 to-white text-gray-900 dark:bg-linear-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 dark:text-white transition-colors duration-300 `}>
      <ChatHeader isMobile={isMobile} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-neutral-900/20 via-transparent to-transparent md:px-4 md:py-6 bg-linear-to-b dark:from-gray-900/50 dark:via-black/50 dark:to-gray-900/50 custom-scrollbar">
        {emptyState}
        {messageList}
        {isTyping && <TypingIndicator />}
        <div ref={scrollRef} className="h-2 md:h-4" />
      </div>
      <ChatInput2 
       input={input}
        setInput={setInput}
        imageFile={imageFile}
        previewUrl={previewUrl}
        isTyping={isTyping}
        onFileChange={handleFileChange}
        onRemoveImage={handleRemoveImage}
        onSubmit={handleSendMessage}/>
    </div>
  );
};

export default CampusAI;