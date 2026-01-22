// src/hooks/useChatHistory.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '../../supabase/supabaseClient';


export const useChatHistory = (userId) => {
  const queryClient = useQueryClient();

  // 1. Obtener historial con caché
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat_messages', userId],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché "fresco"
  });

  // 2. Función para guardar mensajes en la DB y actualizar el caché
  const saveMessageMutation = useMutation({
    mutationFn: async (newMsg) => {
      await supabaseClient.from('chat_messages').insert(newMsg);
    },
    onSuccess: () => {
      // Esto hace que el historial se refresque automáticamente
      queryClient.invalidateQueries(['chat_messages', userId]);
    }
  });

  return { messages, isLoading, saveMessage: saveMessageMutation.mutate };
};