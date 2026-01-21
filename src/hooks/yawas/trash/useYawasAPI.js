// src/features/campusAI/hooks/useYawasAPI.js
import { supabaseClient } from "../../../supabase/supabaseClient";
import { uploadToCloudinary } from "../../../cloudinary/upToCloudinary";
import { getDynamicInstruction } from "../utils/yawasInstructions";
import { processYawasResponse } from "../utils/messageProcessor";
import { toast } from "sonner";

export const useYawasAPI = ({
  userProfile,
  setIsTyping,
  addMessage,
  updateLastMessage,
  updateUserNotes
}) => {
  
  const callYawasAPI = async (provider, uploadedImageUrl, userText, messageHistory) => {
    const session = await supabaseClient.auth.getSession();
    
    return fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yawas-chat-v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          provider,
          systemInstruction: getDynamicInstruction(userProfile),
          imageUrl: uploadedImageUrl,
          messages: messageHistory
            .slice(-8)
            .map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.text,
            }))
            .concat({ role: "user", content: userText }),
        }),
      }
    );
  };

  const streamResponse = async (response, placeholderMsg) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;

      updateLastMessage({ ...placeholderMsg, text: fullText });
    }

    return fullText;
  };

  const sendMessageToYawas = async (userText, imageFile, messageHistory) => {
    setIsTyping(true);

    try {
      let uploadedImageUrl = null;

      if (imageFile) {
        const uploadData = await uploadToCloudinary(imageFile);
        uploadedImageUrl = uploadData.secure_url;
      }

      const userMsg = {
        user_id: userProfile?.id,
        text: userText || "Envió una imagen",
        role: "user",
        image_url: uploadedImageUrl,
      };

      const placeholderBotMsg = {
        user_id: userProfile?.id,
        text: "",
        role: "assistant",
      };

      await addMessage(userMsg);
      await addMessage(placeholderBotMsg);

      // Fallback entre proveedores
      let response = await callYawasAPI("groq", uploadedImageUrl, userText, messageHistory);
      
      if (!response.ok) {
        console.warn("Groq saturado, intentando con Mistral...");
        response = await callYawasAPI("mistral", uploadedImageUrl, userText, messageHistory);
      }
      
      if (!response.ok) {
        response = await callYawasAPI("openai", uploadedImageUrl, userText, messageHistory);
      }

      if (!response.ok) throw new Error("Error en la función");

      const fullText = await streamResponse(response, placeholderBotMsg);

      // Procesar respuesta y guardar notas
      const { cleanText, newNotes } = processYawasResponse(fullText, userProfile);
      
      updateLastMessage({ text: cleanText });
      await addMessage({ ...placeholderBotMsg, text: cleanText });

      if (newNotes.length > 0) {
        await updateUserNotes(newNotes);
      }

    } catch (err) {
      console.error("Error con Yawas:", err);
      toast.error("Yawas se distrajo un poco. ¡Intenta de nuevo!");
    } finally {
      setIsTyping(false);
    }
  };

  const triggerWelcomeGreeting = async (profile, setMessages) => {
    setIsTyping(true);
    const welcomePlaceholder = {
      user_id: profile.id,
      text: "",
      role: "assistant",
    };
    setMessages([welcomePlaceholder]);

    try {
      const session = await supabaseClient.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yawas-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            systemInstruction: `Eres Yawas. Tu amigo ${profile.full_name} acaba de entrar. Basado en sus notas: "${profile.yawas_notes || "No hay notas"}", dale un saludo corto (max 2 oraciones), muy informal y motivador. No uses [[SAVE]] aquí.`,
            messages: [
              { role: "user", content: "¡Hola Yawas! Acabo de entrar." },
            ],
          }),
        }
      );

      const fullText = await streamResponse(response, welcomePlaceholder);

      await supabaseClient.from("chat_messages").insert({
        user_id: profile.id,
        text: fullText,
        role: "assistant",
      });
    } catch (err) {
      console.error("Error en saludo:", err);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    sendMessageToYawas,
    triggerWelcomeGreeting
  };
};