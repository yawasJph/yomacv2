import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";
import { notify } from "@/utils/toast/notifyv3";

export const useChat = (userId, activeFriendId) => {
  const queryClient = useQueryClient();
  const queryKey = ["messages", activeFriendId];
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  // --- 1. OBTENER MENSAJES ---
  const { data: messages = [], isLoading } = useQuery({
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
    enabled: !!activeFriendId,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  // --- 2. ENVIAR MENSAJE (Optimista) ---
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
        id: `temp-${crypto.randomUUID()}`,
        sender_id: userId,
        receiver_id: activeFriendId,
        content: newContent,
        created_at: new Date().toISOString(),
        is_optimistic: true,
      };

      queryClient.setQueryData(queryKey, (old) => [...(old || []), optimisticMsg]);
      return { previousMessages };
    },
    onError: (err, newContent, context) => {
      queryClient.setQueryData(queryKey, context.previousMessages);
      notify.error("Error al enviar mensaje");
    },
    onSuccess: (dataFromDB) => {
      // Importante: No reemplaces por contenido, reemplaza el temporal por el real de la DB
      queryClient.setQueryData(queryKey, (old) => 
        old?.map((m) => (m.is_optimistic ? dataFromDB : m))
      );
      queryClient.invalidateQueries(["mutuals", userId]);
    },
  });

  // --- 3. REACCIONES Y BORRADO ---
  const reactToMessage = async (messageId, emoji) => {
    // Actualización local rápida para UX
    queryClient.setQueryData(queryKey, (old) =>
      old?.map((m) => m.id === messageId ? { ...m, reaction: emoji } : m)
    );
    await supabaseClient.from("direct_messages").update({ reaction: emoji }).eq("id", messageId);
  };

  const deleteMessage = useMutation({
    mutationFn: async (messageId) => {
      await supabaseClient
        .from("direct_messages")
        .update({ content: null, deleted_at: new Date().toISOString() })
        .eq("id", messageId);
    },
    onMutate: (id) => {
      queryClient.setQueryData(queryKey, (old) =>
        old?.map((m) => m.id === id ? { ...m, content: null, deleted_at: new Date().toISOString() } : m)
      );
    }
  });

  // --- 4. REALTIME (Sincronización con RLS) ---
  useEffect(() => {
    if (!activeFriendId) return;

    // Escuchamos los cambios en la tabla filtrados por RLS
    const channel = supabaseClient
      .channel(`chat_room_${activeFriendId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "direct_messages" },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          queryClient.setQueryData(queryKey, (oldData) => {
            const currentMessages = oldData || [];

            if (eventType === "INSERT") {
              // Si el mensaje es del amigo (no mío), lo añadimos
              // Los míos ya los maneja la mutación optimista
              if (newRow.sender_id === activeFriendId && !currentMessages.some(m => m.id === newRow.id)) {
                return [...currentMessages, newRow];
              }
            }

            if (eventType === "UPDATE") {
              return currentMessages.map((m) => m.id === newRow.id ? newRow : m);
            }

            if (eventType === "DELETE") {
              return currentMessages.filter((m) => m.id !== oldRow.id);
            }

            return currentMessages;
          });
        }
      )
      .subscribe();

    return () => { supabaseClient.removeChannel(channel); };
  }, [activeFriendId, queryClient]);

  // --- 5. TYPING LOGIC ---
  const typingChannel = supabaseClient.channel(`typing:${activeFriendId}`);
  
  const sendTypingSignal = useCallback(() => {
    typingChannel.send({ type: "broadcast", event: "typing", payload: { userId } });
  }, [activeFriendId]);

  useEffect(() => {
    const sub = typingChannel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId === activeFriendId) {
          setIsFriendTyping(true);
          setTimeout(() => setIsFriendTyping(false), 3000);
        }
      })
      .subscribe();
    return () => { supabaseClient.removeChannel(sub); };
  }, [activeFriendId]);

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isFriendTyping,
    sendTypingSignal,
    deleteMessage: deleteMessage.mutate,
    reactToMessage,
  };
};