import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";

export const useChat = (userId, activeFriendId) => {
  const queryClient = useQueryClient();
  const queryKey = ["messages", activeFriendId];
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  // 1. OBTENER MENSAJES (Cache)
  const { data: messages = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("direct_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${activeFriendId}),and(sender_id.eq.${activeFriendId},receiver_id.eq.${userId})`,
        )
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!activeFriendId,
  });

  // 2. MARCAR COMO LEÍDO (Mutación)
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      await supabaseClient
        .from("direct_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("sender_id", activeFriendId)
        .eq("receiver_id", userId)
        .eq("is_read", false);
    },
    onSuccess: () => {
      // Actualizamos la cache local para quitar los indicadores de "no leído"
      queryClient.setQueryData(queryKey, (old) =>
        old?.map((m) =>
          m.sender_id === activeFriendId ? { ...m, is_read: true } : m,
        ),
      );
    },
  });

  // 3. BORRAR MENSAJE (Optimista)
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      const { error } = await supabaseClient
        .from("direct_messages")
        .delete()
        .eq("id", messageId);
      if (error) throw error;
    },
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMessages = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) =>
        old.filter((m) => m.id !== messageId),
      );
      return { previousMessages };
    },
    onError: (err, id, context) =>
      queryClient.setQueryData(queryKey, context.previousMessages),
  });

  // 4. LÓGICA DE TYPING (Broadcast)
  const typingChannelName = `typing_${[userId, activeFriendId].sort().join("_")}`;

  const sendTypingSignal = () => {
    if (window.typingPublishTimeout) return;
    supabaseClient.channel(typingChannelName).send({
      type: "broadcast",
      event: "typing",
      payload: { userId },
    });
    window.typingPublishTimeout = setTimeout(() => {
      window.typingPublishTimeout = null;
    }, 2000);
  };

  useEffect(() => {
    const channel = supabaseClient
      .channel(typingChannelName)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId === activeFriendId) {
          setIsFriendTyping(true);
          if (window.typingUIDisplayTimeout)
            clearTimeout(window.typingUIDisplayTimeout);
          window.typingUIDisplayTimeout = setTimeout(
            () => setIsFriendTyping(false),
            3000,
          );
        }
      })
      .subscribe();
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [activeFriendId]);

  // 5. EFECTO: Marcar como leído al entrar o recibir mensajes
  useEffect(() => {
    if (
      activeFriendId &&
      messages.some((m) => m.sender_id === activeFriendId && !m.is_read)
    ) {
      markAsReadMutation.mutate();
      console.log("juju")
    }
  }, [activeFriendId, messages.length]);

  // 2. ENVIAR MENSAJE (Optimistic Mutation)
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
    // Este evento ocurre ANTES de que la petición vaya a Supabase
    onMutate: async (newContent) => {
      // Cancelar cualquier refetch en curso para que no sobreescriba nuestra actualización optimista
      await queryClient.cancelQueries({ queryKey });

      // Guardamos una "foto" de la cache actual por si falla y hay que hacer rollback
      const previousMessages = queryClient.getQueryData(queryKey);

      // Creamos el mensaje temporal (Optimista)
      const optimisticMsg = {
        id: Date.now(), // ID temporal
        sender_id: userId,
        receiver_id: activeFriendId,
        content: newContent,
        created_at: new Date().toISOString(),
        is_sending: true, // Flag para mostrar un icono de "enviando"
      };

      // Actualizamos la cache instantáneamente
      queryClient.setQueryData(queryKey, (old) => [
        ...(old || []),
        optimisticMsg,
      ]);

      return { previousMessages };
    },
    // Si hubo un error (ej. se cortó el internet)
    onError: (err, newContent, context) => {
      queryClient.setQueryData(queryKey, context.previousMessages);
      notify.error("No se pudo enviar el mensaje");
    },
    // Cuando el servidor responde con éxito
    onSuccess: (dataFromDB, variables, context) => {
      // Reemplazamos el mensaje temporal con el real de la DB (que ya tiene el ID definitivo)
      queryClient.setQueryData(queryKey, (old) =>
        old?.map((m) =>
          m.id === context.previousMessages.length + 1 ||
          m.content === variables
            ? dataFromDB
            : m,
        ),
      );

      // Invalidamos la lista de mutuals para que se actualice el "Último mensaje" en la barra lateral
      queryClient.invalidateQueries(["mutuals", userId]);
    },
  });

  // 3. REALTIME (Sincronización para mensajes que RECIBO)
  useEffect(() => {
    if (!activeFriendId) return;
    const channel = supabaseClient
      .channel(`chat_${activeFriendId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "direct_messages" },
        (payload) => {
          // Solo procesamos si el mensaje es del AMIGO hacia MÍ (nosotros ya manejamos los nuestros vía Mutation)
          if (
            payload.eventType === "INSERT" &&
            payload.new.sender_id === activeFriendId
          ) {
            queryClient.setQueryData(queryKey, (old) => [
              ...(old || []),
              payload.new,
            ]);
          }
          // Actualizar estados (leído/borrado)
          if (payload.eventType === "UPDATE") {
            queryClient.setQueryData(queryKey, (old) =>
              old?.map((m) => (m.id === payload.new.id ? payload.new : m)),
            );
          }
          if (payload.eventType === "DELETE") {
            queryClient.setQueryData(queryKey, (old) =>
              old?.filter((m) => m.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [activeFriendId, queryClient, queryKey]);

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isLoading,
    isFriendTyping,
    sendTypingSignal,
    deleteMessage: deleteMessageMutation.mutate,
    isDeleting: deleteMessageMutation.isLoading,
  };
};
