import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient";
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";

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
  const [messages, setMessages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (!userId) return null;
    
    const { data } = await supabaseClient
      .from("profiles")
      .select("full_name, carrera, ciclo, yawas_notes")
      .eq("id", userId)
      .single();

    if (data) setUserProfile(data);
    return data;
  }, [userId]);

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

  // Stream response
  const streamResponse = useCallback(async (response, placeholderMsg) => {
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

  // Save notes
  const saveNotes = useCallback(async (fullText, profile) => {
    const saveMatches = fullText.match(/\[\[SAVE:\s*(.*?)\s*\]\]/g);

    if (saveMatches && profile) {
      const newNotesFound = saveMatches.map((m) =>
        m.replace("[[SAVE:", "").replace("]]", "").trim()
      );

      const updatedNotes = profile.yawas_notes
        ? `${profile.yawas_notes}. ${newNotesFound.join(". ")}`
        : newNotesFound.join(". ");

      await supabaseClient
        .from("profiles")
        .update({ yawas_notes: updatedNotes })
        .eq("id", userId);

      setUserProfile((prev) => ({ ...prev, yawas_notes: updatedNotes }));
    }
  }, [userId]);

  // Welcome greeting
  const triggerWelcomeGreeting = useCallback(async (profile) => {
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

      const fullText = await streamResponse(response, placeholderBotMsg);

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
          triggerWelcomeGreeting(profile);
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