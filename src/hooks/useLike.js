import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const useLike = (postId) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["post_like", postId, user?.id];

  // 1. Consultar si el post ya tiene like del usuario
  const { data: isLiked } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabaseClient
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // 2. Mutación para dar/quitar Like (Optimista)
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw toast.error("Debe iniciar sesion para dar like");

      if (isLiked) {
        return await supabaseClient
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        return await supabaseClient
          .from("likes")
          .insert({ post_id: postId, user_id: user.id });
      }
    },
    // Dentro de useLike.js -> onMutate:
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] }); // Cancelar el feed

      const previousPosts = queryClient.getQueryData(["posts"]);

      // Actualizar el contador dentro de las páginas de InfiniteQuery
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    like_count: isLiked
                      ? post.like_count - 1
                      : post.like_count + 1,
                  }
                : post
            )
          ),
        };
      });

      return { previousPosts };
    },

    onError: (err, newState, context) => {
      // Si falla, volvemos al estado anterior
      queryClient.setQueryData(queryKey, context.previousLiked);
    },
    onSettled: () => {
      // Al final, sincronizamos con la DB para estar 100% seguros
      queryClient.invalidateQueries({ queryKey });
      // También invalidamos el feed completo para que los contadores se actualicen
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    isLiked,
    toggleLike: toggleLike.mutate,
    isLoading: toggleLike.isPending,
  };
};
