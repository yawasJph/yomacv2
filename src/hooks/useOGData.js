// hooks/useLinkPreview.js
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

/**
 * Hook para obtener datos Open Graph (OG) usando una Edge Function de Supabase.
 * @param {string | null} url La URL para la cual obtener la previsualización.
 * @returns {object} El objeto de react-query con data, isLoading, isError, etc.
 */
export const useOGData = (url) => {
  return useQuery({
    queryKey: ["og-data", url],
    
    queryFn: async () => {
      // 1. Usamos el 'url' pasado como argumento (no 'foundUrl')
      const { data, error } = await supabaseClient.functions.invoke("og", {
        body: { url: url }, // Enviamos la URL a la Edge Function
      });

      if (error) {
        // React Query manejará este error.
        throw new Error(error.message || "Error al invocar la función de Supabase");
      }
      
      // 2. Devolvemos los datos. 
      // Si la Edge Function devuelve { status: "success", data: og_data },
      // React Query guardará esto en 'data'.
      if (data && data.status === "success") {
          return data.data; // Devuelve solo la parte de 'data' que contiene los OG datos
      }
      
      // Si el status no es success (aunque la función Edge no haya fallado a nivel de Supabase)
      throw new Error(data?.message || "La función Edge devolvió un error de negocio.");
    },

    // Configuraciones de React Query
    enabled: !!url, // Solo se ejecuta si hay URL
    staleTime: 1000 * 60 * 5, // cache fresco por 5 min
    gcTime: 1000 * 60 * 60, // mantiene cache 1 hora
    retry: 1, // intenta 1 vez más si falla
    refetchOnWindowFocus: false, // no recargar al cambiar ventana
  });
};