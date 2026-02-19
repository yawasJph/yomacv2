// 📦 hooks/usePostState.js
import { useState } from "react";
import { useDebounce } from "./useDebounce";
import { toast } from "sonner";

export const usePostState = () => {
  const [content, setContent] = useState("");
  const debouncedContent = useDebounce(content, 800);

  // Lógica de archivos
  const [files, setFiles] = useState([]); // Array<File>
  const [gifUrls, setGifUrls] = useState([]); // Array<String>

  // ⚠️ CAMBIO PRINCIPAL: Previews ahora guarda objetos { url, type, fileRef? }
  const [previews, setPreviews] = useState([]);

  // Lógica de UI
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [linkPreview, setLinkPreview] = useState(null);
  const [linkPreviewClosed, setLinkPreviewClosed] = useState(false);

  // --- Funciones de Manejo ---

  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);
    if (!text.trim()) setLinkPreviewClosed(false);
  };

  const addEmoji = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const handleGifSelect = (gifData) => {
    // gifData ahora es { url, static }
    if (previews.length >= 4) {
      toast.error("Máximo 4 archivos por post");
      return;
    }

    // Guardamos el objeto completo en gifUrls
    setGifUrls((prev) => [...prev, gifData]);

    // En previews mostramos el gif animado (gifData.url)
    setPreviews((prev) => [...prev, { url: gifData.gifUrl, type: "gif" }]);
    setShowGifPicker(false);
  };

  const handleFileChange = (e) => {
    // 1. Permitimos Video: Ya no filtramos solo "image/"
    // Filtramos para asegurarnos que sean imágenes o videos válidos
    const selectedFiles = Array.from(e.target.files || []).filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/"),
    );

    if (files.length + selectedFiles.length + gifUrls.length > 4) {
      toast.error("Máximo 4 archivos permitidos");
      return;
    }

    // 2. Creamos objetos de preview inteligentes
    const newPreviewsObjects = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      fileRef: file, // Guardamos referencia al archivo original para borrar fácil después
    }));

    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...newPreviewsObjects]);
  };

  const removeFileOrGif = (indexToRemove) => {
    const itemToRemove = previews[indexToRemove];

    // 1. Actualizar Previews
    setPreviews((prev) => prev.filter((_, i) => i !== indexToRemove));

    // 2. Limpieza profunda según el tipo
    if (itemToRemove.type === "gif") {
      // Borrar de lista de GIFs
      //setGifUrls((prev) => prev.filter((url) => url !== itemToRemove.url));
      setGifUrls((prev) => prev.filter((g) => g.gifUrl !== itemToRemove.url));
    } else {
      // Es File (Imagen o Video)
      URL.revokeObjectURL(itemToRemove.url); // Liberar memoria

      // Borrar del array de Files usando la referencia directa (mucho más seguro que índices)
      if (itemToRemove.fileRef) {
        setFiles((prev) => prev.filter((f) => f !== itemToRemove.fileRef));
      }
    }
  };

  const resetForm = () => {
    previews.forEach((p) => {
      if (p.type !== "gif") URL.revokeObjectURL(p.url);
    });

    setContent("");
    setFiles([]);
    setPreviews([]);
    setGifUrls([]);
    setLinkPreviewClosed(false);
    setLinkPreview(null);
    setLoading(false);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
  };

  return {
    content,
    files,
    gifUrls,
    previews,
    loading,
    showEmojiPicker,
    showGifPicker,
    linkPreview,
    linkPreviewClosed,
    debouncedContent,
    setContent,
    setLoading,
    setShowEmojiPicker,
    setShowGifPicker,
    setLinkPreview,
    setLinkPreviewClosed,
    handleContentChange,
    addEmoji,
    handleFileChange,
    handleGifSelect,
    removeFileOrGif,
    resetForm,
  };
};
