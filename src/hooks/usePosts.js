// src/hooks/usePosts.js
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const usePosts = () => {
  return useQuery({
    queryKey: ["feed-posts"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("posts")
        .select(
          `
          id,
          content,
          created_at,
          profiles(full_name, avatar),
          post_images(id, post_id, image_url)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 min -> evita exceso de fetch
    refetchOnWindowFocus: true,
  });
};
