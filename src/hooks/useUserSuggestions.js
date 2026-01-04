// hooks/useUserSuggestions.js
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useUserSuggestions = (userId) => {
  return useQuery({
    queryKey: ["user_suggestions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabaseClient.rpc("get_user_suggestions", {
        p_user_id: userId,
        p_limit: 3,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutos de caché
    refetchOnWindowFocus: false, // Evita que cambien solo por cambiar de pestaña
  });
};