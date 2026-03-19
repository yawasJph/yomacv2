import { supabaseClient } from "@/supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useToggleBan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, currentStatus }) => {
      const { error } = await supabaseClient
        .from("profiles")
        .update({ 
          is_banned: !currentStatus, // Invierte el estado
          banned_at: !currentStatus ? new Date().toISOString() : null,
          ban_reason: !currentStatus ? "Incumplimiento de normas" : null
        })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "users"]);
      notify.success("Estado de usuario actualizado");
    }
  });
};