import { useCallback } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { getDynamicInstruction } from "./useYawasChat2";
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";

export const useYawasApi = (userId, setIsTyping)=>{

// Call Yawas API
 const callYawasAPI = useCallback(async (provider, uploadedImageUrl, userText, profile, messageHistory) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yawas-chat-v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          provider,
          systemInstruction: getDynamicInstruction(profile),
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
    return response;
  }, []);

  // Send message with fallback providers
  const sendMessageWithFallback = useCallback(async (userText, uploadedImageUrl, profile, messageHistory) => {
    let response = await callYawasAPI("groq", uploadedImageUrl, userText, profile, messageHistory);

    if (!response.ok) {
      console.warn("Groq saturado, intentando con Mistral...");
      response = await callYawasAPI("mistral", uploadedImageUrl, userText, profile, messageHistory);
    }

    if (!response.ok) {
      response = await callYawasAPI("openai", uploadedImageUrl, userText, profile, messageHistory);
    }

    if (!response.ok) throw new Error("Error en la función");

    return response;
  }, [callYawasAPI]);


 const streamResponse = useCallback(async (response, placeholderMsg, setMessages) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;

      const cleanText = fullText.replace(/\[\[SAVE:.*?\]\]/g, "").trim();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...placeholderMsg,
          text: cleanText,//fullText
        };
        return updated;
      });
    }

    return fullText;
  }, []);

 const triggerWelcomeGreeting = useCallback(async (profile, setMessages, userId) => {
    setIsTyping(true);
    const welcomePlaceholder = {
      user_id: userId,
      text: "",
      role: "assistant",
    };

    setMessages([welcomePlaceholder]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yawas-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}`,
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages([{ ...welcomePlaceholder, text: fullText }]);
      }

      await supabaseClient.from("chat_messages").insert({
        user_id: userId,
        text: fullText,
        role: "assistant",
      });
    } catch (err) {
      console.error("Error en saludo:", err);
    } finally {
      setIsTyping(false);
    }
  }, [userId]);
  return{
    callYawasAPI,
    getDynamicInstruction,
    sendMessageWithFallback,
    streamResponse,
    triggerWelcomeGreeting
  }
  }