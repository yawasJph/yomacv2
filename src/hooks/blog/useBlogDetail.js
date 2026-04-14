import { supabaseClient } from "@/supabase/supabaseClient";
import { useQuery } from "@tanstack/react-query";

// QUERY: Obtener los detalles del blog por su slug
export const useBlogDetail = ({slug}) => {
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blog_detail", slug],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("blogs")
        .select(
          `
          *,
          author:author_id (
            id,
            full_name,
            avatar,
            carrera,
            ciclo,
            username
          )
        `,
        )
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug, // Solo ejecuta si el slug existe
    staleTime: 1000 * 60 * 5, // Caché fresca por 5 minutos: evita peticiones repetidas al navegar "Atrás"
    retry: 1, // Si falla (ej. slug no existe), solo reintenta 1 vez rápido
  });

  return {
    post, isLoading, isError
  };
};
