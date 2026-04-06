// 📦 hooks/usePostCreation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabaseClient } from "../supabase/supabaseClient";

import { extractHashtags } from "../components/utils/extractHashtags";
import { notify } from "@/utils/toast/notifyv3";
import { uploadToCloudinary } from "@/cloudinary/uploadMediaProgress";
import { useState } from "react";

export const usePostCreation = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({ user, content, files, gifUrls, linkPreview }) => {
      // 1️⃣ Extraer hashtags
      const hashtags = extractHashtags(content);

      // --- LÓGICA PARA TENOR SEO (Estrategia de Preview Estático) ---
      // Nota: WhatsApp y otras RRSS no renderizan GIFs animados en las cards de previsualización.
      // Para solucionar esto sin modificar el esquema de la DB (post_media), inyectamos
      // la URL de la imagen estática (.png) proporcionada por la API de Tenor en el objeto og_data.
      // La Edge Function priorizará esta imagen para asegurar que el post sea visualmente atractivo al compartir.

      // --- LÓGICA PARA TENOR SEO ---
      let finalOgData = linkPreview;

      // Si no hay un link pegado, pero SI hay un GIF, creamos un preview para el share
      if (!finalOgData && gifUrls.length > 0) {
        finalOgData = {
          image: gifUrls[0].staticUrl, // <--- Aquí guardamos el .png estático de Tenor
          title: `Post de ${user.user_metadata?.full_name || "YoMAC"}`,
          description: content.substring(0, 100) || "Mira este GIF en YoMAC",
          is_tenor: true, // Flag opcional por si quieres saber que viene de Tenor
        };
      }

      // 2️⃣ Llamar a la función RPC
      const { data: postId, error: postError } = await supabaseClient.rpc(
        "create_post_with_hashtags",
        {
          p_user_id: user.id,
          p_content: content,
          p_og_data: finalOgData,
          p_hashtags: hashtags,
        },
      );

      if (postError) throw postError;

      // 3️⃣ Subidas a Cloudinary
      const totalFiles = files.length;
      let progressMap = new Array(totalFiles).fill(0);

      const uploadPromises = files.map((file, index) => {
        const isVideo = file.type.startsWith("video/");

        return uploadToCloudinary(file, (progress) => {
          progressMap[index] = progress;

          // 🔥 promedio global
          const totalProgress =
            progressMap.reduce((acc, curr) => acc + curr, 0) / totalFiles;

          setUploadProgress(Math.round(totalProgress));
        }).then((result) => ({
          post_id: postId,
          media_url: result.secure_url,
          media_type: isVideo ? "video" : "image",
          width: result.width,
          height: result.height,
          aspect_ratio: result.width / result.height,
        }));
      });

      const uploadedMedia = await Promise.all(uploadPromises);

      // 4️⃣ Preparar GIFs
      const gifMedia = gifUrls.map((url) => ({
        post_id: postId,
        media_url: url.gifUrl,
        media_type: "image",
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
      setUploadProgress(0); // 🔥 reset
      variables.setLoading(false);
    },
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

  return { createPost, isPending: mutation.isPending, uploadProgress };
};
