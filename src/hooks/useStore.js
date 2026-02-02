// hooks/useStore.js
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useStoreData = (userId) => {
  return useQuery({
    queryKey: ["store", userId],
    queryFn: async () => {
      const [badgesRes, ownedRes] = await Promise.all([
        supabaseClient.from("badges").select("*"),
        supabaseClient.from("user_badges").select("badge_id").eq("user_id", userId)
      ]);
      return {
        items: badgesRes.data || [],
        myItems: ownedRes.data?.map(x => x.badge_id) || []
      };
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
};