// 📦 hooks/usePostCreation.js
import { toast } from "sonner";
import { supabaseClient } from "../supabase/supabaseClient";
import { uploadToCloudinary } from "../cloudinary/upToCloudinary";
import { extractHashtags } from "../components/utils/extractHashtags";

export const usePostCreation = () => {
  
  const createPost = async ({ user, content, files, gifUrls, linkPreview, resetForm, setLoading }) => {
    if (!content.trim() && files.length === 0 && gifUrls.length === 0) {
      toast.error("Escribe algo o sube un archivo");
      return;
    }
    setLoading(true);
    console.log(content)
    try {

      const hashtags = extractHashtags(content)
      ///comiezo ha deletear
      // 1️⃣ Llamar a la función RPC en lugar de un insert simple
      const { data: postId, error: postError } = await supabaseClient
        .rpc('create_post_with_hashtags', {
          p_user_id: user.id,
          p_content: content,
          p_og_data: linkPreview,
          p_hashtags: hashtags
        });

      if (postError) throw postError;
      //const postId = post.id;

      // 2️⃣ Preparar las promesas de subida a Cloudinary
      // Combinamos imágenes y videos del array 'files'
      const uploadPromises = files.map(async (file) => {
        const isVideo = file.type.startsWith('video/');
        const result = await uploadToCloudinary(file);
        
        return {
          post_id: postId,
          media_url: result.secure_url,
          media_type: isVideo ? 'video' : 'image'
        };
      });

      // 3️⃣ Ejecutar todas las subidas en paralelo
      const uploadedMedia = await Promise.all(uploadPromises);

      // 4️⃣ Preparar los GIFs (que ya son URLs)
      const gifMedia = gifUrls.map(url => ({
        post_id: postId,
        media_url: url,
        media_type: 'image'
      }));

      // 5️⃣ Combinar todo e insertar en post_media
      const allMedia = [...uploadedMedia, ...gifMedia];

      if (allMedia.length > 0) {
        const { error: mediaError } = await supabaseClient
          .from("post_media")
          .insert(allMedia);

        if (mediaError) throw mediaError;
      }

      resetForm();
      toast.success("¡Publicado con éxito! 🚀");
      return postId;

    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.message || "Ocurrió un error al publicar");
    } finally {
      setLoading(false);
    }
  };

  return { createPost };
};