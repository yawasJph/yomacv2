import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["notifications", user?.id];
  // Usamos un Ref para el audio para que no se recargue en cada render
  const audioRef = useRef(new Audio("/sounds/notification.mp3"));
  const [isDeleting, setIsDeleting] = useState(false);

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

  // 2. Suscripción en Tiempo Real
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
          const type = payload.new.type;
          // Cuando llega una nueva, invalidamos la query para refrescar la lista
          
          // 2. NUEVO: Leer preferencias de visualización desde localStorage
          // Si no hay nada guardado, asumimos que todo está en true (activo)
          const savedPrefs = localStorage.getItem("yomac_notif_prefs");
          const prefs = savedPrefs
            ? JSON.parse(savedPrefs)
            : { likes: true, comments: true, mentions: true };

          // Filtrar según el tipo de notificación
          if (type === "like" && prefs.likes === false) {
            console.log("🔕 Notificación de Like ignorada por configuración.");
            return; // Detiene la ejecución aquí
          }
          if (type === "comment" && prefs.comments === false) {
            console.log(
              "🔕 Notificación de Comentario ignorada por configuración.",
            );
            return; // Detiene la ejecución aquí
          }
          if (type === "reply" && prefs.replys === false) {
            console.log(
              "🔕 Notificación de Replys ignorada por configuración.",
            );
            return; // Detiene la ejecución aquí
          }
          if (type === "repost" && prefs.reposts === false) {
            console.log(
              "🔕 Notificación de Replys ignorada por configuración.",
            );
            return; // Detiene la ejecución aquí
          }
          if (type === "mention" && prefs.mentions === false) {
            console.log(
              "🔕 Notificación de Mención ignorada por configuración.",
            );
            return; // Detiene la ejecución aquí
          }

          queryClient.invalidateQueries({ queryKey });

          // audioRef.current.play().catch((error) => {
          //   // Esto fallará si el usuario no ha interactuado aún con la web
          //   console.log("El sonido no pudo reproducirse por políticas del navegador.");
          // });

          // // Opcional: Reproducir un sonido o mostrar un aviso visual nativo
          // console.log("¡Nueva notificación!", payload);
          const isSoundEnabled =
            localStorage.getItem("yomac_sound") !== "false";

          if (isSoundEnabled) {
            audioRef.current.play().catch((error) => {
              console.log(
                "Audio bloqueado por el navegador hasta interacción.",
              );
            });
            console.log("🔊 Sonido de notificación reproducido para:", type);
          } else {
            console.log(
              "🔕 Sonido silenciado según las preferencias del usuario.",
            );
          }

          console.log("🔔 ¡Nueva notificación procesada!", type);
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [user, queryClient, queryKey]);

  // 3. Función para marcar como leídas
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

  const clearAll = async () => {
    if (!user) return;
    setIsDeleting(true);
    const { error } = await supabaseClient
      .from("notifications")
      .delete()
      .eq("recipient_id", user.id);

    if (error) {
      console.error("Error borrando notificaciones:", error);
      toast.error("No se pudieron borrar las notificaciones");
      setIsDeleting(false);
      return;
    }

    queryClient.setQueryData(queryKey, []);
    queryClient.invalidateQueries({ queryKey });

    toast.success("Notificaciones borradas");
    setIsDeleting(false);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    isLoading,
    clearAll,
    isDeleting,
  };
};
