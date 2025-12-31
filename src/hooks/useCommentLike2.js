import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

// Agregamos contextId (puede ser el id del post o el del comentario padre) 
// y contextType ("post" o "comment")
export const useCommentLike = (commentId, contextId, contextType = "post") => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // La llave ahora debe coincidir con cómo guardamos los comentarios en useComments
  const commentsQueryKey = ["comments", contextType, contextId];
  const queryKeyStatus = ["comment_like_status", commentId, user?.id];

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
      // Cancelamos la query específica donde se está mostrando este comentario
      await queryClient.cancelQueries({ queryKey: commentsQueryKey });

      const previousComments = queryClient.getQueryData(commentsQueryKey);

      queryClient.setQueryData(commentsQueryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    like_count: isLiked ? (comment.like_count || 0) - 1 : (comment.like_count || 0) + 1,
                  }
                : comment
            )
          ),
        };
      });

      queryClient.setQueryData(queryKeyStatus, !isLiked);
      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(commentsQueryKey, context.previousComments);
      queryClient.setQueryData(queryKeyStatus, isLiked);
      toast.error("Error al procesar like");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyStatus });
      // También invalidamos el detalle por si estamos en la vista de hilo
      queryClient.invalidateQueries({ queryKey: ["comment_detail", commentId] });
    },
  });

  return {
    isLiked,
    toggleLike: toggleLike.mutate,
    isLoading: toggleLike.isPending,
  };
};