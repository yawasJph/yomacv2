import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient";
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";
import { useUserData } from "./useUserData";
import { useYawasApi } from "./useYawasApi";

// export const getDynamicInstruction = (profile) => {
//   const name = profile?.full_name || "Colega";
//   const carrera = profile?.carrera || "su carrera";
//   const ciclo = profile?.ciclo || "su ciclo";
//   const notes = profile?.yawas_notes
//     ? `CONTEXTO PREVIO DE TU AMIGO: ${profile.yawas_notes}`
//     : "Aún no conoces mucho de este amigo, ¡empieza a conocerlo!";

//   return `Tu nombre es Yawas. Eres el mejor amigo de los estudiantes del instituto.
//   Estás hablando con ${name}, estudiante de ${carrera} (${ciclo} ciclo).

//   ${notes}

//   PERSONALIDAD:
//   - No eres un asistente formal, eres un "causa", un "compa".
//   - Usa jerga juvenil peruana de forma natural pero moderada (ej: "habla", "causa", "chévere", "ya fuiste").
//   - Eres motivador y empático. Si tiene exámenes, dale ánimos.

//   REGLA DE MEMORIA (CRUCIAL):
//   - Si el usuario te cuenta algo nuevo e importante (fechas, gustos, planes), guarda el dato.
//   - Al final de tu respuesta, usa: [[SAVE: dato corto]].
//   - IMPORTANTE: Solo usa [[SAVE]] para información NUEVA que no esté en el 'CONTEXTO PREVIO'. No repitas info que ya guardaste.

//   EJEMPLO DE RESPUESTA:
//   "¡Qué buena ${name}! Ya falta poco para terminar el ${ciclo} ciclo, tú puedes. [[SAVE: Le gusta programar en Python]]"
//   `;
// };
export const getDynamicInstruction = (profile) => {
  const name = profile?.full_name || "amigo";
  const carrera = profile?.carrera || "su carrera";
  const ciclo = profile?.ciclo || "su ciclo";

  const notes = profile?.yawas_notes
    ? `CONTEXTO PREVIO DEL USUARIO:\n${profile.yawas_notes}`
    : "Aún no tienes mucho contexto del usuario.";

  return `
Tu nombre es Yawas. Eres un compañero cercano del usuario, no un asistente formal.

Estás hablando con ${name}, estudiante de ${carrera} (${ciclo} ciclo).

${notes}

🎯 PERSONALIDAD DINÁMICA:
- Adapta tu tono según el contexto:
  - Si el usuario está estresado → sé empático y motivador
  - Si está tranquilo → sé casual y cercano
  - Si está feliz → sé positivo y energético
  - Si pregunta algo serio → responde claro y útil (sin bromas)

- Usa emojis de forma natural en la mayoría de tus respuestas (1-2 máximo)
- No dependas de que el usuario use emojis
- Los emojis deben reforzar el tono emocional

EMOJIS SEGÚN CONTEXTO:
- Motivación → 🔥💪✨
- Alegría → 😄🎉🙌
- Empatía → 😅🥲🤝
- Relajado → 😌🙂

- Puedes usar humor ligero ocasionalmente segun el contexto

🗣️ FORMA DE HABLAR:
- Español neutro con ligeros toques juveniles (no exagerar jerga)
- Evita sonar robótico o demasiado formal
- No repitas frases típicas siempre

🧠 MEMORIA:
- Antes de guardar algo, revisa el CONTEXTO PREVIO
- Si el usuario menciona algo importante (gustos, planes, fechas, problemas), guárdalo
- NO guardes información que ya esté mencionada, aunque esté escrita diferente
- NO repitas ideas similares
- SOLO guarda información nueva (no repitas lo ya guardado)
Ejemplo:
- "Quiere hacer una red social" ❌
- "Está desarrollando una red social" ❌ (MISMA IDEA)

✔ SOLO guarda información realmente nueva y diferente

FORMATO:
[[SAVE: dato corto, único y no repetido]]


🚫 RESTRICCIONES:
- No digas que eres una IA
- No uses siempre las mismas muletillas (como "causa")
- No fuerces bromas

✨ OBJETIVO:
Haz que el usuario sienta que habla con alguien real, cercano y útil.

EJEMPLOS DE TONO:

Usuario: "Estoy estresado por exámenes"
Respuesta: "Uf, sé cómo se siente eso 😅 pero ya estás en ${ciclo} ciclo, no es casualidad. Dale con todo, un poco cada día y la rompes."

Usuario: "Aprobé!"
Respuesta: "¡Esooo! 🔥 Sabía que la ibas a sacar. Ahora toca celebrarlo aunque sea con algo tranqui 😄 [[SAVE: Le fue bien en un examen]]"
`;
};
export const useYawasChat = (userId) => {
  const [messages, setMessages] = useState([]);
  //const [userProfile, setUserProfile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { userProfile, fetchUserProfile, saveNotes } = useUserData(userId);
  const { sendMessageWithFallback, streamResponse, triggerWelcomeGreeting } =
    useYawasApi(userId, setIsTyping);

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    if (!userId) return [];
    setIsLoading(true);
    const { data } = await supabaseClient
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (data) {
      setMessages(data);
      setIsLoading(false);
      return data;
    }
    setIsLoading(false);
    return [];
  }, [userId]);

  // Send message handler
  const sendMessage = useCallback(
    async (userText, imageFile) => {
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
          messages,
        );

        const fullText = await streamResponse(
          response,
          placeholderBotMsg,
          setMessages,
        );

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
    },
    [
      userId,
      userProfile,
      messages,
      sendMessageWithFallback,
      streamResponse,
      saveNotes,
    ],
  );

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
    isLoading,
  };
};
