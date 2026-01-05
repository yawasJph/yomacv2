import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useSearch = (query, currentUserId) => {
  return useQuery({
    queryKey: ["search", query, currentUserId],
    queryFn: async () => {
      if (!query) return { posts: [], users: [] };

      const cleanQuery = query.startsWith("#") ? query.slice(1) : query;

      const [resPosts, resUsers] = await Promise.all([
        supabaseClient
          .from("posts_search_view")
          .select("*, profiles:user_id(*), post_media(*)")
          .or(`content.ilike.%${cleanQuery}%, hashtag_names.ilike.%${cleanQuery}%`)
          .order("created_at", { ascending: false }),
        
        supabaseClient
          .from("profiles")
          .select(`*, followers!following_id (follower_id),equipped_badges:user_badges ( 
        is_equipped,
        badges ( icon, name )
      )`)
          .or(`full_name.ilike.%${cleanQuery}%, carrera.ilike.%${cleanQuery}%`)
      ]);

      if (resPosts.error) throw resPosts.error;
      if (resUsers.error) throw resUsers.error;

      // Procesar si ya los sigues
      const processedUsers = (resUsers.data || []).map((profile) => ({
        ...profile,
        is_already_followed: profile.followers?.some(f => f.follower_id === currentUserId),
      }));

      return {
        posts: resPosts.data || [],
        users: processedUsers || [],
      };
    },
    enabled: !!query, // Solo se ejecuta si hay una búsqueda
    staleTime: 1000 * 60 * 2, // Mantener resultados 2 min
  });
};