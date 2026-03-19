import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/supabase/supabaseClient";

export const useUrgentReports = () => {
  return useQuery({
    queryKey: ["admin", "reports", "urgent"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("reports")
        .select(
          `
          id,
          reason,
          details,
          created_at,
          status,
          reporter:reporter_id (full_name, avatar),
          post:post_id (id, content, author:profiles(id, full_name), post_media(media_url, media_type)),
          comment:comment_id (id, content, author:profiles(id, full_name))
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });
};
