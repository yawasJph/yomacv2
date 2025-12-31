import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const useCommentLike = (commentId, postId) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKeyStatus = ["comment_like_status", commentId, user?.id];

  // 1. Verificar si el usuario actual le dio like a ESTE comentario
  const { data: isLiked } = useQuery({
    queryKey: queryKeyStatus,
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabaseClient
        .from("comment_likes")
        .select("*")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // 2. Mutación con actualización optimista
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Debe iniciar sesión");

      if (isLiked) {
        return await supabaseClient
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
      } else {
        return await supabaseClient
          .from("comment_likes")
          .insert({ comment_id: commentId, user_id: user.id });
      }
    },
    onMutate: async () => {
      // Cancelamos consultas de comentarios para este post
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const previousComments = queryClient.getQueryData(["comments", postId]);

      // Actualizamos la caché de InfiniteQuery de forma optimista
      queryClient.setQueryData(["comments", postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    like_count: isLiked ? comment.like_count - 1 : comment.like_count + 1,
                  }
                : comment
            )
          ),
        };
      });

      // También actualizamos el estado del corazón localmente
      queryClient.setQueryData(queryKeyStatus, !isLiked);

      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["comments", postId], context.previousComments);
      queryClient.setQueryData(queryKeyStatus, isLiked);
      toast.error("Error al procesar like");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyStatus });
    },
  });

  return {
    isLiked,
    toggleLike: toggleLike.mutate,
    isLoading: toggleLike.isPending,
  };
};