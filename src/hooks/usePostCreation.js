// 📦 hooks/usePostCreation.js
import { toast } from "sonner";
import { supabaseClient } from "../supabase/supabaseClient";

/**
 * Hook para manejar la creación de un post, incluyendo subida de archivos.
 */
export const usePostCreation = () => {
  
  const createPost = async ({ user, content, files, gifUrls, linkPreview, resetForm, setLoading }) => {
    
    if (!content.trim() && files.length === 0 && gifUrls.length === 0) {
      toast.error("Escribe algo o sube un archivo");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Crear el post base
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
      const imageUrls = [];

      // 2️⃣ Subir archivos reales
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `post-${postId}/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
          .from("posts")
          .upload(filePath, file, { contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseClient.storage
          .from("posts")
          .getPublicUrl(filePath);

        imageUrls.push(urlData.publicUrl);
      }

      // 3️⃣ Agregar URLs de GIFs
      imageUrls.push(...gifUrls);

      // 4️⃣ Insertar URLs en la tabla post_images
      if (imageUrls.length > 0) {
        const { error: imagesError } = await supabaseClient
          .from("post_images")
          .insert(
            imageUrls.map((url, index) => ({
              post_id: postId,
              image_url: url,
              // Opcional: index para mantener el orden
              //order: index, 
            }))
          );

        if (imagesError) throw imagesError;
      }

      resetForm();
      toast.success("¡Publicado!");
      
      // Retornar el ID del post o los datos si es necesario actualizar la UI
      return post; 

    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al publicar");
    } finally {
      setLoading(false);
    }
  };

  return { createPost };
};