import { supabaseClient } from "@/supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const DEFAULT_FILTERS = {
  category: "all",
  status: "all",
};

export function useBugReport({ category = DEFAULT_FILTERS.category, status = DEFAULT_FILTERS.status } = {}) {
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
    queryKey: ["admin_bug_reports", category, status],
    queryFn: async () => {
      let query = supabaseClient
        .from("bug_reports")
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
        .from("bug_reports")
        .insert([
          {
            user_id: userId,
            category: category,
            description: description,
            image_url: image_url,
            device_info: device_info,
            status: "pendiente", // Opcional, ya está por defecto en SQL
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      notify.success(
        variables.category === "bug"
          ? "¡Error reportado! Gracias por ayudarnos a mejorar YoMAC."
          : "¡Sugerencia enviada! La tendremos muy en cuenta.",
      );
      queryClient.invalidateQueries({ queryKey: ["admin_bug_reports"] });
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
        .from("bug_reports")
        .update({ status: newStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedReport) => {
      notify.success(
        updatedReport.status === "revisado"
          ? "¡Reporte marcado como revisado!"
          : "Reporte puesto en revision.",
      );
      // Invalida la caché para que se recargue la lista al instante
      queryClient.invalidateQueries({ queryKey: ["admin_bug_reports"] });
    },
    onError: () => {
      notify.error("Hubo un error al actualizar el estado.");
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
  };
}
