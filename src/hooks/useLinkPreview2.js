// 📦 hooks/useLinkPreview.js
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

/**
 * Hook para obtener datos Open Graph (OG) usando la Edge Function 'og' de Supabase.
 * @param {string | null} debouncedContent El texto para buscar una URL.
 * @param {boolean} linkPreviewClosed Si el usuario cerró el preview manualmente.
 */
export const useLinkPreview = (debouncedContent, linkPreviewClosed) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // 1. Extraer la primera URL del contenido
  const urls = debouncedContent.match(urlRegex);
  const foundUrl = urls ? urls[0] : null;
  
  // 2. Usar useQuery condicionalmente.
  const queryResult = useQuery({
    queryKey: ["og-data", foundUrl],
    
    queryFn: async () => {
      // La lógica de fetch de tu componente original:
      const { data, error } = await supabaseClient.functions.invoke("og", {
        body: { url: foundUrl },
      });

      if (error) throw new Error(error.message || "Error Supabase Function");

      if (data && data.status === "success") {
          // Normalizamos y devolvemos solo los datos que nos interesan
          return {
            url: foundUrl,
            title: data.data.title,
            description: data.data.description,
            image: data.data.image?.url,
            logo: data.data.logo?.url,
            publisher: data.data.publisher,
          };
      }
      
      throw new Error(data?.message || "La función Edge no devolvió éxito.");
    },

    // Solo se ejecuta si hay una URL VÁLIDA y el usuario NO lo cerró manualmente.
    enabled: !!foundUrl && !linkPreviewClosed, 
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    retry: 1, 
    refetchOnWindowFocus: false,
  });

  // Devolvemos el resultado de la query y la URL encontrada.
  return { ...queryResult, foundUrl };
};