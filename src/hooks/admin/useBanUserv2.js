import {useMutation, useQueryClient} from "@tanstack/react-query"
import {notify} from "../../utils/toast/notifyv3"
import { supabaseClient } from "@/supabase/supabaseClient";

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }) => {
      const { error } = await supabaseClient
        .from("profiles")
        .update({ 
          is_banned: true, 
          ban_reason: reason || "Incumplimiento de normas", 
          banned_at: new Date().toISOString() 
        })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "reports"]);
      queryClient.invalidateQueries(["profile"]);
      notify.success("Usuario baneado correctamente");
    },
    onError: (error) => {
      console.error(error);
      notify.error("Error al intentar banear");
    }
  });
};