// hooks/usePostForm.js
import { useState } from "react";
import { toast } from "sonner";
import { supabaseClient } from "../supabase/supabaseClient";

export const usePostForm = (user) => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [gifUrls, setGifUrls] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleContentChange = (e) => setContent(e.target.value);

  const addEmoji = (emoji) => setContent((prev) => prev + emoji);

  const handleFileChange = (incomingFiles) => {
    if (previews.length >= 4) return toast.error("Máximo 4 imágenes");

    const accepted = incomingFiles.filter((f) => f.type.startsWith("image/"));

    const blobUrls = accepted.map((file) => URL.createObjectURL(file));

    setFiles((prev) => [...prev, ...accepted]);
    setPreviews((prev) => [...prev, ...blobUrls]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((x) => x.filter((_, i) => i !== index));
    setPreviews((x) => x.filter((_, i) => i !== index));
  };

  const addGif = (gifUrl) => {
    if (previews.length >= 4) return toast.error("Máximo 4 archivos");
    setGifUrls((p) => [...p, gifUrl]);
    setPreviews((p) => [...p, gifUrl]);
  };

  const clearAll = () => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setContent("");
    setFiles([]);
    setPreviews([]);
    setGifUrls([]);
  };

  const submit = async (linkPreview) => {
    if (!content.trim() && previews.length === 0) {
      return toast.error("Escribe algo o sube una imagen");
    }

    setLoading(true);

    try {
      const { data: post } = await supabaseClient
        .from("posts")
        .insert({
          user_id: user.id,
          content,
          og_data: linkPreview || null,
        })
        .select("id")
        .single();

      const postId = post.id;

      const urls = [];

      for (const file of files) {
        const fileName = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
        const filePath = `post-${postId}/${fileName}`;

        await supabaseClient.storage.from("posts").upload(filePath, file);

        const { data } = supabaseClient.storage
          .from("posts")
          .getPublicUrl(filePath);

        urls.push(data.publicUrl);
      }

      gifUrls.forEach((gif) => urls.push(gif));

      if (urls.length > 0) {
        await supabaseClient.from("post_images").insert(
          urls.map((url) => ({
            post_id: postId,
            image_url: url,
          }))
        );
      }

      clearAll();
      toast.success("¡Publicado!");
    } catch (err) {
      console.error(err);
      toast.error("Error al publicar");
    }

    setLoading(false);
  };

  return {
    content,
    previews,
    loading,
    handleContentChange,
    handleFileChange,
    removeImage,
    addGif,
    addEmoji,
    submit,
  };
};
