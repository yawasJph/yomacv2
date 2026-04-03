import { REPORT_BUGS } from "@/consts/bugs";
import { supabaseClient } from "@/supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBugReport({
  category = REPORT_BUGS.category.default,
  status = REPORT_BUGS.category.default,
} = {}) {
  const queryClient = useQueryClient();

  // 1. Obtener los reportes con la información del usuario
  // const {
  //   data: reports,
  //   isLoading,
  //   isError,
  // } = useQuery({
  //   queryKey: ["admin_bug_reports"],
  //   queryFn: async () => {
  //     const { data, error } = await supabaseClient
  //       .from("bug_reports")
  //       .select(
  //         `
  //         *,
  //         profiles:user_id ( full_name, avatar, username, ciclo , carrera )
  //       `,
  //       )
  //       .eq("status", "pendiente")
  //       .order("created_at", { ascending: false });
  //     if (error) throw error;
  //     return data;
  //   },
  // });

  const {
    data: reports,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [REPORT_BUGS.queryKey, category, status],
    queryFn: async () => {
      let query = supabaseClient
        .from(REPORT_BUGS.table)
        .select(
          `
          *,
          profiles:user_id ( full_name, avatar, username, ciclo , carrera )
        `,
        )
        .order("created_at", { ascending: false });

      if (category !== "all") {
        query = query.eq("category", category);
      }

      if (status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // 1. Configuración de la mutación con React Query
  const reportMutation = useMutation({
    mutationFn: async ({
      category,
      description,
      userId,
      image_url,
      device_info,
    }) => {
      const { data, error } = await supabaseClient
        .from(REPORT_BUGS.table)
        .insert([
          {
            user_id: userId,
            category: category,
            description: description,
            image_url: image_url,
            device_info: device_info,
            status: REPORT_BUGS.status.pending, // Opcional, ya está por defecto en SQL
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      const isBug = variables.category === REPORT_BUGS.category.bug;
      notify.success(
        isBug
          ? "¡Error reportado! Gracias por ayudarnos a mejorar YoMAC."
          : "¡Sugerencia enviada! La tendremos muy en cuenta.",
      );
      queryClient.invalidateQueries({ queryKey: [REPORT_BUGS.queryKey] });
    },
    onError: (error) => {
      console.error("Error al enviar el reporte:", error);
      notify.error(
        "Hubo un problema al enviar el reporte. Inténtalo de nuevo.",
      );
    },
  });

  // 2. Mutación para cambiar el estado a 'resuelto' o 'pendiente'
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const { data, error } = await supabaseClient
        .from(REPORT_BUGS.table)
        .update({ status: newStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedReport) => {
      const isResolved = updatedReport.status === REPORT_BUGS.status.resolved
      notify.success(
        isResolved
          ? "¡Reporte marcado como resuelto!"
          : "Reporte puesto en revision.",
      );
      // Invalida la caché para que se recargue la lista al instante
      queryClient.invalidateQueries({ queryKey: [REPORT_BUGS.queryKey] });
    },
    onError: () => {
      notify.error("Hubo un error al actualizar el estado.");
    },
  });

  // 2. Mutación para cambiar el estado a 'resuelto' o 'pendiente'
  const deleteReportMutation = useMutation({
    mutationFn: async ({ id }) => {
      const { data, error } = await supabaseClient
        .from(REPORT_BUGS.table)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      notify.success("¡Reporte eliminado!");
      // Invalida la caché para que se recargue la lista al instante
      queryClient.invalidateQueries({ queryKey: [REPORT_BUGS.queryKey] });
    },
    onError: () => {
      notify.error("Hubo un error al eliminar el reporte.");
    },
  });

  return {
    reports,
    isLoading,
    isError,
    sendReport: reportMutation.mutate,
    reportLoading: reportMutation.isPending,
    updateReport: updateStatusMutation.mutate,
    updateLoading: updateStatusMutation.isPending,
    deleteReport: deleteReportMutation.mutate,
    isDeleting: deleteReportMutation.isPending,
  };
}
