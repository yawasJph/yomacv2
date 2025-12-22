// 📦 hooks/usePostCreation.js
import { toast } from "sonner";
import { supabaseClient } from "../supabase/supabaseClient";
import { uploadToCloudinary } from "../cloudinary/upToCloudinary";

export const usePostCreation = () => {
  
  const createPost = async ({ user, content, files, gifUrls, linkPreview, resetForm, setLoading }) => {

    console.log(files)
    if (!content.trim() && files.length === 0 && gifUrls.length === 0) {
      toast.error("Escribe algo o sube un archivo");
      return;
    }
    setLoading(true);

    try {
      // 1️⃣ Crear el post base en Supabase primero
      const { data: post, error: postError } = await supabaseClient
        .from("posts")
        .insert({
          user_id: user.id,
          content: content,
          og_data: linkPreview,
        })
        .select("id")
        .single();

      if (postError) throw postError;
      const postId = post.id;

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
      return post;

    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.message || "Ocurrió un error al publicar");
    } finally {
      setLoading(false);
    }
  };

  return { createPost };
};