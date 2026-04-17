import { supabaseClient } from "@/supabase/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export const useWeeklyBestScore = (userId) => {
  return useQuery({
    queryKey: ["weekly-best-score", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("generic_weekly_ranking")
        .select("max_score")
        .eq("user_id", userId)
        .eq("game_id", "memory")
        .maybeSingle();

      if (error) throw error;

      return data?.max_score ?? null;
    },
    staleTime: 1000 * 60 * 5, // 🧠 cache 5 min
  });
};