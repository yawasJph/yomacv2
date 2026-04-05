import { supabaseClient } from "@/supabase/supabaseClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCleanup = ({ activeTab }) => {
  const queryClient = useQueryClient();
  // 1. Fetch de elementos en la papelera según la pestaña
  const { data: trashedItems, isLoading } = useQuery({
    queryKey: ["admin_trash", activeTab],
    queryFn: async () => {
      let query;

      if (activeTab === "posts") {
        query = supabaseClient
          .from("posts")
          .select(
            `id, content, deleted_at, profiles:user_id (username, avatar), post_media!left (media_url, media_type)`,
          )
          .not("deleted_at", "is", null);
      } else if (activeTab === "comments") {
        query = supabaseClient
          .from("comments")
          .select(
            `id, content, deleted_at, profiles:user_id (username, avatar)`,
          )
          .not("deleted_at", "is", null)
          .is("parent_id", null); // Comentarios principales
      } else {
        query = supabaseClient
          .from("comments")
          .select(
            `id, content, deleted_at, profiles:user_id (username, avatar)`,
          )
          .not("deleted_at", "is", null)
          .not("parent_id", "is", null); // Respuestas (tienen parent_id)
      }

      const { data, error } = await query.order("deleted_at", {
        ascending: false,
      });
      if (error) throw error;
      return data;
    },
  });

  // 2. Mutación para Restaurar un elemento individual
  const restoreMutation = useMutation({
    mutationFn: async ({ id, type }) => {
      const table = type === "posts" ? "posts" : "comments";
      const { error } = await supabaseClient
        .from(table)
        .update({ deleted_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Elemento restaurado con éxito.");
      queryClient.invalidateQueries({ queryKey: ["admin_trash"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // 3. Mutación para Eliminar Permanentemente (Individual o Todo)
  const hardDeleteMutation = useMutation({
    mutationFn: async ({ id, type, isBulk = false }) => {
      const table = type === "posts" ? "posts" : "comments";
      let query = supabaseClient.from(table).delete();

      if (isBulk) {
        // Borrar todo lo de esta pestaña que tenga deleted_at
        query = query.not("deleted_at", "is", null);
        if (type === "comments") {
          // Filtro extra si estamos en la pestaña de comments o replies
          query =
            activeTab === "comments"
              ? query.is("parent_id", null)
              : query.not("parent_id", "is", null);
        }
      } else {
        // Borrar uno solo
        query = query.eq("id", id);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isBulk
          ? "Limpieza masiva completada."
          : "Elemento eliminado permanentemente.",
      );
      queryClient.invalidateQueries({ queryKey: ["admin_trash"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    trashedItems,
    isLoading,
    restore: restoreMutation.mutate,
    isRestoring: restoreMutation.isPending,
    delete: hardDeleteMutation.mutate,
    isDeleting: hardDeleteMutation.isPending,
  };
};
