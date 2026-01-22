import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient";
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";
import { useChatHistory } from "./useChatHistory"; // <-- Importamos tu nuevo hook

// (Mantenemos la función getDynamicInstruction igual...)
const getDynamicInstruction = (profile) => {
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
  // 1. CACHÉ: Sustituimos el useState manual por el hook de TanStack Query
  const { messages, isLoading: loadingHistory, saveMessage } = useChatHistory(userId);
  
  const [userProfile, setUserProfile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [streamedText, setStreamedText] = useState(""); // Estado temporal para el efecto de escritura

  // 2. Simplificamos la carga del perfil (puedes luego pasar esto también a un hook con caché)
  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabaseClient
      .from("profiles")
      .select("full_name, carrera, ciclo, yawas_notes")
      .eq("id", userId)
      .single();
    if (data) setUserProfile(data);
  }, [userId]);

  // 3. Modificamos el envío para usar saveMessage (que actualiza el caché de TanStack Query)
  const sendMessage = useCallback(async (userText, imageFile) => {
    if (!userText.trim() && !imageFile) return;
    setIsTyping(true);

    try {
      let uploadedImageUrl = null;
      if (imageFile) {
        const uploadData = await uploadToCloudinary(imageFile);
        uploadedImageUrl = uploadData.secure_url;
      }

      // Guardamos en la DB y actualizamos el caché instantáneamente
      const userMsg = {
        user_id: userId,
        text: userText || "Envió una imagen",
        role: "user",
        image_url: uploadedImageUrl,
        created_at: new Date().toISOString()
      };
      saveMessage(userMsg);

      // Llamada a la API (manteniendo tu lógica de fallback)
      const response = await sendMessageWithFallback(userText, uploadedImageUrl, userProfile, messages);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      // STREAMING: Usamos un estado local "streamedText" para no saturar el caché por cada letra
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setStreamedText(fullText.replace(/\[\[SAVE:.*?\]\]/g, "").trim());
      }

      const cleanText = fullText.replace(/\[\[SAVE:.*?\]\]/g, "").trim();

      // Guardamos la respuesta final del bot en el caché y DB
      saveMessage({
        user_id: userId,
        text: cleanText,
        role: "assistant",
        created_at: new Date().toISOString()
      });

      setStreamedText(""); // Limpiamos el temporal
      await saveNotes(fullText, userProfile); // Guardar info importante si existe [[SAVE]]

    } catch (err) {
      toast.error("Yawas se distrajo. ¡Intenta de nuevo!");
    } finally {
      setIsTyping(false);
    }
  }, [userId, userProfile, messages, saveMessage, saveNotes]);

  // 4. Lógica de bienvenida inteligente
  useEffect(() => {
    fetchUserProfile();
    // Si ya terminó de cargar el historial y está vacío, saludamos
    if (!loadingHistory && messages.length === 0 && userProfile) {
       triggerWelcomeGreeting(userProfile);
    }
  }, [userId, loadingHistory, messages.length, userProfile]);

  return {
    // IMPORTANTE: Combinamos los mensajes del caché con el que se está escribiendo ahora
    messages: streamedText 
      ? [...messages, { role: "assistant", text: streamedText, id: "temp" }] 
      : messages,
    isTyping,
    userProfile,
    sendMessage,
    isLoading: loadingHistory // Para mostrar un spinner si gustas
  };
};