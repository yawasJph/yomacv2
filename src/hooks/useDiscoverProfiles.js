import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";

export const useDiscoverProfiles = ({ activeTab, selectedCiclo, searchTerm }) => {
  return useQuery({
    queryKey: ["discover", activeTab, selectedCiclo, searchTerm],
    queryFn: async () => {
      let query = supabaseClient
        .from("profiles_with_stats")
        .select("*")
        .order("followers_count", { ascending: false });

      if (activeTab !== "TODOS") {
        query = query.eq("carrera", activeTab);
      }

      if (selectedCiclo) {
        query = query.eq("ciclo", selectedCiclo);
      }

      if (searchTerm) {
        query = query.ilike("full_name", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    // No pedir datos si no hay cambios, mantener en caché 5 min
    staleTime: 1000 * 60 * 5,
    // Evita recargas molestas al cambiar de ventana
    refetchOnWindowFocus: false,
  });
};