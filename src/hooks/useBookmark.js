import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const useBookmark = (postId) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["bookmark_status", postId, user?.id];

  // 1. Consultar estado (Caché global)
  const { data: isBookmarked } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabaseClient
        .from("bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // 2. Mutación Optimista
  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (!user) throw toast.error("Inicia sesion para guardar");
      
      if (isBookmarked) {
        return await supabaseClient.from("bookmarks").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        return await supabaseClient.from("bookmarks").insert({ post_id: postId, user_id: user.id });
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousStatus = queryClient.getQueryData(queryKey);
      
      // Actualización inmediata en UI
      queryClient.setQueryData(queryKey, !isBookmarked);
      
      return { previousStatus };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(queryKey, context.previousStatus);
      toast.error("Error al actualizar marcador");
    },
    onSuccess: () => {
      if (isBookmarked) toast.success("Guardado en marcadores");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      // Invalidamos la lista de guardados para que se refresque
      queryClient.invalidateQueries({ queryKey: ["posts", { type: "bookmarks" }] });
    },
  });

  return { 
    isBookmarked, 
    toggleBookmark: toggleBookmark.mutate, 
    isPending: toggleBookmark.isPending 
  };
};