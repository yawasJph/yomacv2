import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useSearch } from "../../context/SearchContext";
import { notify } from "@/utils/toast/notifyv3";

export const useRepost = (postId) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["post_repost", postId, user?.id];
  const {queryG} = useSearch()

  // 1. Consultar si el post ya tiene repost del usuario
  const { data: isReposted } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabaseClient
        .from("reposts")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // 2. Mutación para Repost/Unrepost
  const toggleRepost = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Debe iniciar sesión");

      if (isReposted) {
        return await supabaseClient
          .from("reposts")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        return await supabaseClient
          .from("reposts")
          .insert({ post_id: postId, user_id: user.id });
      }
    },
    onMutate: async () => {
      // Cancelar cualquier refetch para no sobreescribir el estado optimista
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData(["posts"]);

      // Actualizar contadores en el feed de forma optimista
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    repost_count: isReposted
                      ? (post.repost_count || 1) - 1
                      : (post.repost_count || 0) + 1,
                  }
                : post
            )
          ),
        };
      });

      return { previousPosts };
    },
    onError: (err, newState, context) => {
      queryClient.setQueryData(["posts"], context.previousPosts);
      notify.error("No se pudo completar la acción");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({  queryKey: ["search", queryG, user.id], });
    },
     onSuccess: () => {
      if(!isReposted) return notify.success("Has reposteado");
      notify.success("Has dejado de repostear")
    },
  });

  return {
    isReposted,
    toggleRepost: toggleRepost.mutate,
    isLoading: toggleRepost.isPending,
  };
};