import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/supabase/supabaseClient";

export const useAdminUsers = (searchTerm = "", filter = "all") => {
  return useQuery({
    queryKey: ["admin", "users", searchTerm, filter],
    queryFn: async () => {
      let query = supabaseClient
        .from("profiles")
        .select("id, full_name, avatar, email, is_banned, created_at, carrera")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.ilike("full_name", `%${searchTerm}%`);
      }

      if (filter === "banned") {
        query = query.eq("is_banned", true);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
  });
};