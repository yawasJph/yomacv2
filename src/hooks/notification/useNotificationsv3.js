import { useEffect, useRef } from "react";
import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabaseClient } from "@/supabase/supabaseClient";
import { useAuth } from "@/context/AuthContext";

const PAGE_SIZE = 20;

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["notifications", user?.id];
  const audioRef = useRef(new Audio("/sounds/notification.mp3"));

  // 1. Infinite Query para paginación por cursor
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      let query = supabaseClient
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
        .limit(PAGE_SIZE);

      // Cursor-based pagination: traemos registros más antiguos que el cursor
      if (pageParam) {
        query = query.lt("created_at", pageParam);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    // El cursor de la siguiente página es el created_at del último elemento
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return lastPage[lastPage.length - 1].created_at;
    },
    initialPageParam: null,
    enabled: !!user,
  });

  // Aplanamos todas las páginas en un solo array
  const notifications = data?.pages.flat() ?? [];

  // 2. Mutación para borrar todo con Optimistic Update
  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabaseClient
        .from("notifications")
        .delete()
        .eq("recipient_id", user.id);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      // Reseteamos a estructura de InfiniteQuery vacía
      queryClient.setQueryData(queryKey, {
        pages: [[]],
        pageParams: [null],
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
      toast.error("No se pudieron borrar las notificaciones");
    },
    onSuccess: () => {
      toast.success("Notificaciones borradas");
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
          // Insertamos la nueva notificación al inicio de la primera página
          // sin invalidar toda la query (evita refetch innecesario)
          queryClient.setQueryData(queryKey, (oldData) => {
            if (!oldData) return oldData;
            const newNotification = payload.new;
            const [firstPage, ...restPages] = oldData.pages;
            return {
              ...oldData,
              pages: [[newNotification, ...firstPage], ...restPages],
            };
          });

          audioRef.current
            .play()
            .catch(() =>
              console.log("El sonido no pudo reproducirse por políticas del navegador."),
            );
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [user, queryClient, queryKey]);

  // 4. Marcar como leídas
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
    // Nuevas props para el scroll infinito
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    clearAll: clearMutation.mutate,
    isDeleting: clearMutation.isPending,
    isSuccessDeleting: clearMutation.isSuccess,
  };
};