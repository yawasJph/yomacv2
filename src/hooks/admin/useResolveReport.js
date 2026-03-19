import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";

export const useResolveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status, contentId, contentType, action }) => {
      // 1. Actualizar el estado del reporte
      const { error: reportError } = await supabaseClient
        .from("reports")
        .update({ status: status }) // 'resolved', 'dismissed', etc.
        .eq("id", reportId);

      if (reportError) throw reportError;

      // 2. Si el admin eligió borrar el contenido
      if (action === "delete") {
        const table = contentType === "post" ? "posts" : "comments";
        const { error: deleteError } = await supabaseClient
          .from(table)
          .delete()
          .eq("id", contentId);

        if (deleteError) throw deleteError;
      }
    },
    onSuccess: () => {
      
      //const table = contentType === "post" ? "posts" : "comments";
      // Refrescamos las estadísticas y la lista de reportes urgentes
      queryClient.invalidateQueries(["admin", "stats", "reports-count"]);
      queryClient.invalidateQueries(["admin", "reports", "urgent"]);
      queryClient.invalidateQueries(["comment_detail"]);
      queryClient.invalidateQueries(["posts"]);
      notify.success("Acción realizada con éxito");
    },
    onError: (error) => {
      console.error("Error al moderar:", error);
      notify.error("No se pudo completar la acción");
    },
  });
};