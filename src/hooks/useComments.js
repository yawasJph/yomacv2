import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useComments = (id, type = "post") => {
  const queryClient = useQueryClient();

  // 1. Obtener comentarios paginados
  const commentsQuery = useInfiniteQuery({
    queryKey: ["comments", type, id],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabaseClient
        .from("comments_with_counts")
        .select(
          `
          *,
          profiles:user_id (id, full_name, avatar, carrera, ciclo)
        `
        )
        // .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + 9);

      if (type === "post") {
        query = query.eq("post_id", id).is("parent_id", null); // Solo comentarios principales
      } else {
        query = query.eq("parent_id", id); // Solo respuestas de un comentario
      }

      const { data, error } = await query;
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
    mutationFn: async ({
      content,
      userId,
      postId,
      parentId = null,
      gifUrl = null,
    }) => {
      const { data, error } = await supabaseClient
        .from("comments")
        .insert({
          post_id: postId,
          user_id: userId,
          content,
          parent_id: parentId,
          gif_url: gifUrl,
        })
        .select(`*, profiles:user_id (id, full_name, avatar, carrera, ciclo)`)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData(["comments", type, id], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            [newComment, ...old.pages[0]], // Insertar la nueva respuesta al inicio de la primera página
            ...old.pages.slice(1),
          ],
        };
      });

      // 2. Opcional: Invalidar el detalle del comentario padre para que el reply_count suba
      queryClient.invalidateQueries({ queryKey: ["comment_detail", id] });
    },
  });

  return { ...commentsQuery, addComment: addCommentMutation.mutate };
};
