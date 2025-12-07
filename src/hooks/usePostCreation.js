// 📦 hooks/usePostCreation.js
import { toast } from "sonner";
import { supabaseClient } from "../supabase/supabaseClient";

export const usePostCreation = () => {
  
  const createPost = async ({ user, content, files, gifUrls, linkPreview, resetForm, setLoading }) => {
    
    if (!content.trim() && files.length === 0 && gifUrls.length === 0) {
      toast.error("Escribe algo o sube un archivo");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Separar Video de Imágenes
      // Buscamos si hay algún archivo que sea video
      const videoFile = files.find(f => f.type.startsWith('video/'));
      const imageFiles = files.filter(f => f.type.startsWith('image/'));

      // 2️⃣ Crear el post base (INSERT inicial)
      const { data: post, error: postError } = await supabaseClient
        .from("posts")
        .insert({
          user_id: user.id,
          content: content,
          og_data: linkPreview,
          // Nota: Aún no tenemos la URL del video, actualizaremos después de subirlo
          // Si quisieras optimizar, podrías subir primero y luego insertar todo junto,
          // pero necesitamos el ID del post para crear la carpeta en storage.
        })
        .select("id")
        .single();

      if (postError) throw postError;

      const postId = post.id;
      const imageUrls = [];

      // 3️⃣ Lógica de VIDEO
      if (videoFile) {
        const fileExt = videoFile.name.split(".").pop() || 'mp4';
        const fileName = `video_${crypto.randomUUID()}.${fileExt}`;
        const filePath = `post-${postId}/${fileName}`;

        // Subir Video
        const { error: uploadError } = await supabaseClient.storage
          .from("posts") // Asegúrate que este bucket acepte videos
          .upload(filePath, videoFile, { 
            contentType: videoFile.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Obtener URL
        const { data: urlData } = supabaseClient.storage
          .from("posts")
          .getPublicUrl(filePath);

        // ACTUALIZAR la tabla posts con la URL del video
        const { error: updateError } = await supabaseClient
            .from("posts")
            .update({ video: urlData.publicUrl }) // Columna creada en el paso 1
            .eq("id", postId);

        if (updateError) throw updateError;
      }

      // 4️⃣ Lógica de IMÁGENES (Upload en paralelo para velocidad)
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
            const fileExt = file.name.split(".").pop();
            const fileName = `img_${crypto.randomUUID()}.${fileExt}`;
            const filePath = `post-${postId}/${fileName}`;

            const { error } = await supabaseClient.storage
                .from("posts")
                .upload(filePath, file, { contentType: file.type });
            
            if (error) throw error;

            const { data } = supabaseClient.storage
                .from("posts")
                .getPublicUrl(filePath);
            
            return data.publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls.push(...uploadedUrls);
      }

      // 5️⃣ Agregar URLs de GIFs
      imageUrls.push(...gifUrls);

      // 6️⃣ Insertar imágenes/GIFs en la tabla post_images
      if (imageUrls.length > 0) {
        const { error: imagesError } = await supabaseClient
          .from("post_images")
          .insert(
            imageUrls.map((url) => ({
              post_id: postId,
              image_url: url,
            }))
          );

        if (imagesError) throw imagesError;
      }

      resetForm();
      toast.success("¡Publicado! 🚀");
      
      return post; 

    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Ocurrió un error al publicar");
    } finally {
      setLoading(false);
    }
  };

  return { createPost };
};