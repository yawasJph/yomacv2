import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/supabase/supabaseClient";

export const useReportsStats = () => {
  return useQuery({
    queryKey: ["admin", "stats", "reports-count"],
    queryFn: async () => {
      // 1. Obtener total de pendientes
      const { count: pending, error: err1 } = await supabaseClient
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // 2. Obtener reportes de las últimas 24 horas (para la tendencia)
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      
      const { count: recent, error: err2 } = await supabaseClient
        .from("reports")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString());

      if (err1 || err2) throw (err1 || err2);

      return {
        pending: pending || 0,
        recent24h: recent || 0,
      };
    },
    staleTime: 1000 * 30, // Reportes los queremos más "frescos" (30 segundos)
  });
};