// src/hooks/usePostsInfiniteQuery.js
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const usePostsInfiniteQuery = () => {
  const fetchPosts = async ({ pageParam = null }) => {
    const query = supabaseClient
      .from("posts")
      .select(
        `
        id,
        content,
        og_data,
        created_at,
        profiles(full_name, avatar),
        post_images(id, post_id, image_url)
      `
      )
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
    queryKey: ["posts"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].created_at; // cursor
    },
    staleTime: 1000 * 30, // 30s evita refetch excesivo
  });
};
