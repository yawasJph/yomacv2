import { supabaseClient } from "@/supabase/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export const useSimpleProfile = (userId) => {
  return useQuery({
    queryKey: ["profile-simple", userId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("profiles") // Usamos la tabla base, no la vista
        .select("id, full_name, avatar, carrera, ciclo, is_admin, username") // Solo estos campos
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // Los datos básicos de perfil no cambian seguido (10 min)
  });
};