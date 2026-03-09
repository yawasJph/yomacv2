import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";

export const useChat = (userId, activeFriendId) => {
  const queryClient = useQueryClient();
  const queryKey = ["messages", activeFriendId];
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  // 1. OBTENER MENSAJES (Cache + Fetch)
  const { data: messages = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${activeFriendId}),and(sender_id.eq.${activeFriendId},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeFriendId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache "fresca"
  });

  // 2. ENVIAR MENSAJE (Mutación Optimista)
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const { data, error } = await supabaseClient
        .from("direct_messages")
        .insert([{ sender_id: userId, receiver_id: activeFriendId, content }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (newContent) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMessages = queryClient.getQueryData(queryKey);

      const optimisticMsg = {
        id: Date.now(),
        sender_id: userId,
        receiver_id: activeFriendId,
        content: newContent,
        created_at: new Date().toISOString(),
        is_read: false,
        is_optimistic: true, // Para estilos si quisieras ponerlo en gris
      };

      queryClient.setQueryData(queryKey, (old) => [...(old || []), optimisticMsg]);
      return { previousMessages };
    },
    onError: (err, newContent, context) => {
      queryClient.setQueryData(queryKey, context.previousMessages);
      notify.error("Error al enviar mensaje");
    },
    onSuccess: () => {
      // Actualizar lista de mutuals para el "Último mensaje"
      queryClient.invalidateQueries(["mutuals", userId]);
    }
  });

  // 3. BORRAR MENSAJE (Optimista)
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      const { error } = await supabaseClient.from("direct_messages").delete().eq("id", messageId);
      if (error) throw error;
    },
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMessages = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => old?.filter((m) => m.id !== messageId));
      return { previousMessages };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(queryKey, context.previousMessages);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mutuals", userId]);
    }
  });

  // 4. MARCAR COMO LEÍDO
  const markAsRead = async () => {
    if (!activeFriendId || !userId) return;
    await supabaseClient
      .from("direct_messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("sender_id", activeFriendId)
      .eq("receiver_id", userId)
      .eq("is_read", false);
  };

  // 5. LÓGICA DE TYPING (Broadcast)
  const typingChannelName = `typing_${[userId, activeFriendId].sort().join("_")}`;
  
  const sendTypingSignal = () => {
    if (window.typingPublishTimeout) return;
    const channel = supabaseClient.channel(typingChannelName);
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId },
    });
    window.typingPublishTimeout = setTimeout(() => { window.typingPublishTimeout = null; }, 2000);
  };

  // 6. SUSCRIPCIONES (Realtime + Typing)
  useEffect(() => {
    if (!activeFriendId) return;

    const channel = supabaseClient
      .channel(`room_${activeFriendId}`)
      // Escuchar Mensajes Nuevos, Cambios y Borrados
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, (payload) => {
        if (payload.eventType === "INSERT") {
          // Si el mensaje es del amigo hacia mí
          if (payload.new.sender_id === activeFriendId) {
            queryClient.setQueryData(queryKey, (old) => [...(old || []), payload.new]);
            markAsRead(); // Marcar como leído automáticamente si tengo el chat abierto
          }
        }
        if (payload.eventType === "UPDATE") {
          queryClient.setQueryData(queryKey, (old) => 
            old?.map(m => m.id === payload.new.id ? payload.new : m)
          );
        }
        if (payload.eventType === "DELETE") {
          queryClient.setQueryData(queryKey, (old) => old?.filter(m => m.id !== payload.old.id));
        }
      })
      // Escuchar Typing
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId === activeFriendId) {
          setIsFriendTyping(true);
          if (window.typingUIDisplayTimeout) clearTimeout(window.typingUIDisplayTimeout);
          window.typingUIDisplayTimeout = setTimeout(() => setIsFriendTyping(false), 3000);
        }
      })
      .subscribe();

    // Marcar como leídos los existentes al entrar
    markAsRead();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [activeFriendId, userId]);

  return {
    messages,
    loading,
    isFriendTyping,
    sendTypingSignal,
    sendMessage: sendMessageMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    isDeleting: deleteMessageMutation.isLoading,
  };
};