import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";

export const useMutuals = (userId) => {
  const queryClient = useQueryClient();
  const [onlineUsers, setOnlineUsers] = useState({});

  // Query para Mutuals con RPC
  const { data: mutuals = [], isLoading: loadingMutuals } = useQuery({
    queryKey: ["mutuals", userId],
    queryFn: async () => {
      const { data, error } = await supabaseClient.rpc(
        "get_mutual_followers_with_unread",
        {
          p_user_id: userId,
        },
      );
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Suscripción a presencia (Online/Offline)
  useEffect(() => {
    if (!userId) return;
    const channel = supabaseClient.channel("global_presence", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () =>
        setOnlineUsers(channel.presenceState()),
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: userId,
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  // Suscripción a cambios globales para reordenar la lista
  useEffect(() => {
    const channel = supabaseClient
      .channel("global_messages_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        () => queryClient.invalidateQueries(["mutuals", userId]),
      )
      .subscribe();
    return () => supabaseClient.removeChannel(channel);
  }, [userId, queryClient]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabaseClient
      .channel("mutuals_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "direct_messages" },
        () => {
          // Si cualquier mensaje cambia (nuevo, leído o borrado),
          // refrescamos la lista de amigos
          queryClient.invalidateQueries(["mutuals", userId]);
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return { mutuals, onlineUsers, loadingMutuals };
};
