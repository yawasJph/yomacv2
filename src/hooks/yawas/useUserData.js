import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabaseClient } from "../../supabase/supabaseClient";

export const useUserData = (userId) => {
  
  const [userProfile, setUserProfile] = useState(null);

  useEffect(()=>{
    fetchUserProfile()
  },[userId])

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return null;

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("full_name, carrera, ciclo, yawas_notes")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (data) setUserProfile(data);
    return data;
  }, [userId]);

  const getDynamicInstruction = () => {
    if (!userProfile) return;
    const name = userProfile?.full_name || "Colega";
    const carrera = userProfile?.carrera || "su carrera";
    const ciclo = userProfile?.ciclo || "su ciclo";
    const notes = userProfile?.yawas_notes
      ? `CONTEXTO PREVIO DE TU AMIGO: ${userProfile.yawas_notes}`
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

  

  // Stream response
  

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

  return {
    userProfile,
    fetchUserProfile,
    saveNotes,
    getDynamicInstruction
  };
};
