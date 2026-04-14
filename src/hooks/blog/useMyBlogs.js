import { supabaseClient } from "@/supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMyBlogs = ({ user }) => {
  const queryClient = useQueryClient();
  // 1. QUERY: Obtener los blogs del usuario
  const { data: blogs = [], isLoading , isError} = useQuery({
    queryKey: ["my_blogs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("blogs")
        .select("id, title, slug, status, created_at, reading_time")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id, // Solo se ejecuta si el usuario está autenticado
  });

  // 2. MUTATION: Eliminar un blog
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabaseClient
        .from("blogs")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      notify.success("Artículo eliminado correctamente");
      // Invalidar para refrescar "Mis blogs" y el feed general
      queryClient.invalidateQueries({ queryKey: ["my_blogs", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["blogs_feed"] });
    },
    onError: (error) => {
      console.error("Error al eliminar:", error);
      notify.error("No se pudo eliminar el artículo");
    },
  });

  return {
    blogs,
    isLoading,
    isError,
    deleteMutation
  };
};
