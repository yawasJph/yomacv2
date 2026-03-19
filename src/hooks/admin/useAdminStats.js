import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/supabase/supabaseClient";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats", "users-count"],
    queryFn: async () => {
      // Usamos { count: 'exact', head: true } para obtener solo el número
      // sin traer ninguna fila de datos. Esto es ultra rápido.
      const { count, error } = await supabaseClient
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      // Opcional: Podrías traer cuántos se unieron hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newToday } = await supabaseClient
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      return {
        total: count || 0,
        newToday: newToday || 0,
      };
    },
    // No necesitamos que esto se refresque cada segundo
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};