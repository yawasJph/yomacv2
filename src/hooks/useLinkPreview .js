// hooks/useLinkPreview.js
import { useQuery } from "@tanstack/react-query";

export const useLinkPreview = (url) => {
  return useQuery({
    queryKey: ["link-preview", url],
    queryFn: async () => {
      const res = await fetch(
        "https://vrbfinqvtyclfmvhheub.supabase.co/functions/v1/hyper-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Si usas supabaseClient desde el browser, ponle tu anon-key
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!res.ok) {
        throw new Error("Error al obtener metadata");
      }

      return res.json();
    },

    enabled: !!url,               // solo ejecuta si hay URL
    staleTime: 1000 * 60 * 5,     // cache fresco por 5 min
    gcTime: 1000 * 60 * 60,       // mantiene cache 1 hora
    retry: 1,                     // intenta 1 vez más si falla
    refetchOnWindowFocus: false,  // no recargar al cambiar ventana
  });
};
