// hooks/useTrendingHashtags.js
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useTrendingHashtags = () => {
  return useQuery({
    queryKey: ["trending_hashtags"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("trending_hashtags")
        .select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de datos "frescos" en caché
    refetchOnWindowFocus: false,
  });
};