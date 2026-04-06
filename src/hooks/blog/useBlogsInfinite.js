import { useInfiniteQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/supabase/supabaseClient";

const PAGE_SIZE = 6; // Cantidad de blogs a cargar por cada scroll

export const useBlogsInfinite = () => {
  return useInfiniteQuery({
    queryKey: ["blogs_feed"],
    queryFn: async ({ pageParam = 0 }) => {
      // Calcular el rango para Supabase (ej: 0 a 5, 6 a 11, etc.)
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabaseClient
        .from("blogs")
        .select(`
          *, 
          profiles:author_id (full_name, avatar)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: data || [],
        // Si nos trajo la cantidad exacta que pedimos, es probable que haya una página siguiente
        nextPage: data?.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    // Le dice a React Query cuál es el parámetro para la siguiente llamada
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};