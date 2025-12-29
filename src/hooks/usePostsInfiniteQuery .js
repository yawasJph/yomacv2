// src/hooks/usePostsInfiniteQuery.js
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const usePostsInfiniteQuery = () => {
  const fetchPosts = async ({ pageParam = null }) => {
    const query = supabaseClient
     .from("posts_with_counts") // 👈 Cambiamos la tabla por la vista
      .select(`
        *,
        profiles:user_id (id, full_name, avatar, carrera, ciclo),
        post_media (id, media_url, media_type)
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10);

    if (pageParam) {
      query.lt("created_at", pageParam);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  return useInfiniteQuery({
    queryKey: ["posts-v3"], // Cambiamos la key para limpiar la caché vieja
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].created_at;
    },
    staleTime: 1000 * 30,
  });
};
