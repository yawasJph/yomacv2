import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient";
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";
import { useUserData } from "./useUserData";
import { useYawasApi } from "./useYawasApi";

export const getDynamicInstruction = (profile) => {
  const name = profile?.full_name || "Colega";
  const carrera = profile?.carrera || "su carrera";
  const ciclo = profile?.ciclo || "su ciclo";
  const notes = profile?.yawas_notes
    ? `CONTEXTO PREVIO DE TU AMIGO: ${profile.yawas_notes}`
    : "Aún no conoces mucho de este amigo, ¡empieza a conocerlo!";

  return `Tu nombre es Yawas. Eres el mejor amigo de los estudiantes del instituto.
  Estás hablando con ${name}, estudiante de ${carrera} (${ciclo} ciclo).
  
  ${notes}
  
  PERSONALIDAD:
  - No eres un asistente formal, eres un "causa", un "compa".
  - Usa jerga juvenil peruana de forma natural pero moderada (ej: "habla", "causa", "chévere", "ya fuiste").
  - Eres motivador y empático. Si tiene exámenes, dale ánimos.
  
  REGLA DE MEMORIA (CRUCIAL):
  - Si el usuario te cuenta algo nuevo e importante (fechas, gustos, planes), guarda el dato.
  - Al final de tu respuesta, usa: [[SAVE: dato corto]].
  - IMPORTANTE: Solo usa [[SAVE]] para información NUEVA que no esté en el 'CONTEXTO PREVIO'. No repitas info que ya guardaste.
  
  EJEMPLO DE RESPUESTA:
  "¡Qué buena ${name}! Ya falta poco para terminar el ${ciclo} ciclo, tú puedes. [[SAVE: Le gusta programar en Python]]"
  `;
};

export const useYawasChat = (userId) => {
  const [messages, setMessages] = useState([]);
  //const [userProfile, setUserProfile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const { userProfile,fetchUserProfile,saveNotes } = useUserData(userId)
  const {sendMessageWithFallback,streamResponse,triggerWelcomeGreeting} = useYawasApi(userId, setIsTyping)

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
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
  }, [userId]);


  // Send message handler
  const sendMessage = useCallback(async (userText, imageFile) => {
    const hasText = userText.trim().length > 0;
    const hasImage = imageFile !== null;

    if (!hasText && !hasImage) return;

    setIsTyping(true);

    try {
      let uploadedImageUrl = null;

      if (imageFile) {
        const uploadData = await uploadToCloudinary(imageFile);
        uploadedImageUrl = uploadData.secure_url;
      }

      const userMsg = {
        user_id: userId,
        text: userText || "Envió una imagen",
        role: "user",
        image_url: uploadedImageUrl,
      };

      const placeholderBotMsg = {
        user_id: userId,
        text: "",
        role: "assistant",
      };

      setMessages((prev) => [...prev, userMsg, placeholderBotMsg]);
      await supabaseClient.from("chat_messages").insert(userMsg);

      const response = await sendMessageWithFallback(
        userText,
        uploadedImageUrl,
        userProfile,
        messages
      );

      const fullText = await streamResponse(response, placeholderBotMsg, setMessages);

      const cleanText = fullText.replace(/\[\[SAVE:.*?\]\]/g, "").trim();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = cleanText;
        return updated;
      });

      await supabaseClient.from("chat_messages").insert({
        user_id: userId,
        text: cleanText,
        role: "assistant",
      });

      await saveNotes(fullText, userProfile);
    } catch (err) {
      console.error("Error con Yawas:", err);
      toast.error("Yawas se distrajo un poco. ¡Intenta de nuevo!");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  }, [userId, userProfile, messages, sendMessageWithFallback, streamResponse, saveNotes]);

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      if (userId) {
        const profile = await fetchUserProfile();
        const history = await fetchChatHistory();

        if (history.length === 0 && profile) {
          triggerWelcomeGreeting(profile, setMessages, userId);
        }
      }
    };

    initChat();
  }, [userId, fetchUserProfile, fetchChatHistory, triggerWelcomeGreeting]);

  return {
    messages,
    isTyping,
    userProfile,
    sendMessage,
  };
};