import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";

export const useDeletePost = (post_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const { error } = await supabaseClient
        .from("posts")
        .update({ deleted_at: new Date() }) // Usamos Soft Delete (el campo ya existe en tu SQL)
        .eq("id", postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidamos el feed para que el post desaparezca
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      //, {queryKey: ["post", post_id]}
      // 2. IMPORTANTÍSIMO: Invalidamos los hashtags
      // Esto hará que el conteo en el componente TrendingTopics se actualice
      queryClient.invalidateQueries({ queryKey: ["trending_hashtags"] });
      notify.success("Publicación eliminada");
    },
    onError: (error) => {
      console.error(error);
      notify.error("No se pudo eliminar la publicación");
    }
  });
};