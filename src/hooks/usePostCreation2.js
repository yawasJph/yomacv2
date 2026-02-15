// 📦 hooks/usePostCreation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabaseClient } from "../supabase/supabaseClient";
import { uploadToCloudinary } from "../cloudinary/upToCloudinary";
import { extractHashtags } from "../components/utils/extractHashtags";
import { notify } from "@/utils/toast/notifyv3";

export const usePostCreation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ user, content, files, gifUrls, linkPreview }) => {
      // 1️⃣ Extraer hashtags
      const hashtags = extractHashtags(content);

      // 2️⃣ Llamar a la función RPC
      const { data: postId, error: postError } = await supabaseClient
        .rpc('create_post_with_hashtags', {
          p_user_id: user.id,
          p_content: content,
          p_og_data: linkPreview,
          p_hashtags: hashtags
        });

      if (postError) throw postError;

      // 3️⃣ Subidas a Cloudinary
      const uploadPromises = files.map(async (file) => {
        const isVideo = file.type.startsWith('video/');
        const result = await uploadToCloudinary(file);
        return {
          post_id: postId,
          media_url: result.secure_url,
          media_type: isVideo ? 'video' : 'image'
        };
      });

      const uploadedMedia = await Promise.all(uploadPromises);

      // 4️⃣ Preparar GIFs
      const gifMedia = gifUrls.map(url => ({
        post_id: postId,
        media_url: url,
        media_type: 'image'
      }));

      const allMedia = [...uploadedMedia, ...gifMedia];

      // 5️⃣ Insertar multimedia
      if (allMedia.length > 0) {
        const { error: mediaError } = await supabaseClient
          .from("post_media")
          .insert(allMedia);
        if (mediaError) throw mediaError;
      }

      return { postId, hasHashtags: hashtags.length > 0 };
    },
    onSuccess: (data, variables) => {
      // 🔄 Sincronizar Feed
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      // 🔄 Sincronizar Hashtags SOLO si el post tenía alguno
      if (data.hasHashtags) {
        queryClient.invalidateQueries({ queryKey: ["trending_hashtags"] });
      }

      variables.resetForm();
      notify.success("¡Publicado con éxito! 🚀");
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      notify.error(error.message || "Ocurrió un error al publicar");
    },
    onSettled: (data, error, variables) => {
     variables.setLoading(false);
    }
  });

  // Función puente para mantener tu interfaz actual
  const createPost = (params) => {
    const { content, files, gifUrls } = params;
    if (!content.trim() && files.length === 0 && gifUrls.length === 0) {
      toast.error("Escribe algo o sube un archivo");
      return;
    }
    params.setLoading(true);
    mutation.mutate(params);
  };

  return { createPost, isPending: mutation.isPending };
};