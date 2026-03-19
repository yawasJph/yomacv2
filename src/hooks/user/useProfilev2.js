// hooks/useProfile.js
import { supabaseClient } from "@/supabase/supabaseClient";
import { useQuery } from "@tanstack/react-query";


export const useProfile = (usernameParam) => {
  return useQuery({
    queryKey: ["profile", usernameParam],
    queryFn: async () => {
      // Si el username de la URL trae un "@" al inicio, se lo quitamos
      const cleanUsername = usernameParam.startsWith('@') 
        ? usernameParam.slice(1) 
        : usernameParam;

      const { data, error } = await supabaseClient
        .from("profiles_with_stats")
        .select("id, full_name, avatar, ciclo, cover, carrera, socials, credits, email, bio, created_at, username, is_banned, equipped_badges, followers_count, following_count")
        .eq("username", cleanUsername) // 👈 Buscamos por username
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!usernameParam,
  });
};