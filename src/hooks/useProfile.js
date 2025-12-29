import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useProfile = (userId) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("profiles_with_stats")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};