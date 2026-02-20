import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/supabase/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { notify } from "@/utils/toast/notifyv3";

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["notifications", user?.id];
  // Usamos un Ref para el audio para que no se recargue en cada render
  const audioRef = useRef(new Audio("/sounds/notification.mp3"));

  // 1. Obtener notificaciones iniciales
  const { data: notifications = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("notifications")
        .select(
          `
          *,
          sender:sender_id (full_name, avatar, id),
          post:post_id (content),
          comments:comment_id (content, parent_id)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // 2. MUTACIÓN para borrar todo (La gran mejora)
  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabaseClient
        .from("notifications")
        .delete()
        .eq("recipient_id", user.id);
      if (error) throw error;
    },
    // Optimistic Update: Borramos de la UI antes de que termine en la DB
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousNotifications = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, []);
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousNotifications);
      notify.error("No se pudieron borrar las notificaciones");
    },
    onSuccess: () => {
      notify.success("Notificaciones borradas");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 3. Suscripción en Tiempo Real
  useEffect(() => {
    if (!user) return;

    const channel = supabaseClient
      .channel(`notifications_user_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          // Cuando llega una nueva, invalidamos la query para refrescar la lista
          queryClient.invalidateQueries({ queryKey });

          audioRef.current.play().catch((error) => {
            // Esto fallará si el usuario no ha interactuado aún con la web
            console.log(
              "El sonido no pudo reproducirse por políticas del navegador.",
            );
          });

          // Opcional: Reproducir un sonido o mostrar un aviso visual nativo
          console.log("¡Nueva notificación!", payload);
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [user, queryClient, queryKey]);

  // 4. Función para marcar como leídas
  const markAsRead = async () => {
    if (!user) return;
    await supabaseClient
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    queryClient.invalidateQueries({ queryKey });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    isLoading,
    clearAll: clearMutation.mutate,
    isDeleting: clearMutation.isPending,
    isSuccessDeleting: clearMutation.isSuccess,
  };
};
