import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";
import { toast } from "sonner";

export const useDeleteComment = (postId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId) => {
      const { error } = await supabaseClient.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      toast.success("Comentario eliminado");
    },
    onError: () =>{
        toast.error("No se puedo eliminar el comentario");
    }
  });
};