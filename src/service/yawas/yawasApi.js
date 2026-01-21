// src/services/yawasApi.js
import { supabaseClient } from "../../supabase/supabaseClient";


export const callYawasAPI = async (provider, body) => {
  const session = await supabaseClient.auth.getSession();
  const token = session.data.session?.access_token;

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yawas-chat-v2`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ provider, ...body }),
    }
  );
  return response;
};

// Función resiliente que intenta con varios proveedores
export const getResilientChatResponse = async (payload) => {
  const providers = ["groq", "mistral", "openai"];
  
  for (const provider of providers) {
    try {
      const response = await callYawasAPI(provider, payload);
      if (response.ok) return response;
      console.warn(`Proveedor ${provider} falló, intentando el siguiente...`);
    } catch (err) {
      console.error(`Error con ${provider}:`, err);
    }
  }
  throw new Error("Ningún proveedor de IA está disponible.");
};





