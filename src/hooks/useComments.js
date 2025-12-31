import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useComments = (postId) => {
  const queryClient = useQueryClient();

  // 1. Obtener comentarios paginados
  const commentsQuery = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabaseClient
        .from("comments_with_counts")
        .select(
          `
          *,
          profiles:user_id (id, full_name, avatar, carrera, ciclo)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + 9);

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return allPages.length * 10;
    },
  });

  // 2. Insertar nuevo comentario
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, userId, gifUrl = null }) => {
      const { data, error } = await supabaseClient
        .from("comments")
        .insert({ post_id: postId, user_id: userId, content, gif_url: gifUrl })
        .select(`*, profiles:user_id (id, full_name, avatar, carrera, ciclo)`)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (newComment) => {
      // Actualizamos la caché de comentarios inmediatamente
      queryClient.setQueryData(["comments", postId], (old) => ({
        ...old,
        pages: [[newComment, ...old.pages[0]], ...old.pages.slice(1)],
      }));
      // Invalidamos el post para que el contador de comentarios (comment_count) suba
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  return { ...commentsQuery, addComment: addCommentMutation.mutate };
};
