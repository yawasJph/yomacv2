import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useProfile = (userId) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("profiles_with_stats")
        .select("id, full_name, avatar, ciclo, cover, carrera, socials, bio, credits, email, created_at, username, is_banned, equipped_badges, followers_count, following_count")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
