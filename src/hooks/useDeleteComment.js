import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";

export const useDeleteComment = (postId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId) => {
      const { error } = await supabaseClient
        .from("comments")
        .update({ deleted_at: new Date() })
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      notify.success("Comentario eliminado");
    },
    onError: () => {
      notify.error("No se puedo eliminar el comentario");
    },
  });
};
