// 📦 hooks/usePostState.js
import { useState } from "react";
import { useDebounce } from "./useDebounce";
import { toast } from "sonner";

export const usePostState = () => {
  const [content, setContent] = useState("");
  const debouncedContent = useDebounce(content, 800);
  
  // Lógica de archivos
  const [files, setFiles] = useState([]); // archivos File reales
  const [gifUrls, setGifUrls] = useState([]); // URLs de GIF
  const [previews, setPreviews] = useState([]); // Previews: URLs de File (blob) o URLs de GIF
  
  // Lógica de UI/Acciones
  const [loading, setLoading] = useState(false); // Estado de publicación
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);

  // Lógica de Link Preview
  const [linkPreview, setLinkPreview] = useState(null);
  const [linkPreviewClosed, setLinkPreviewClosed] = useState(false);

  // --- Funciones de Manejo ---

  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);

    // Si el usuario borra todo el texto, reseteamos el bloqueo manual del link
    if (!text.trim()) {
      setLinkPreviewClosed(false);
    }
  };

  const addEmoji = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };
  
  const handleGifSelect = (gifUrl) => {
    if (previews.length >= 4) {
      toast.error("Máximo 4 archivos por post");
      return;
    }

    setGifUrls((prev) => [...prev, gifUrl]);
    setPreviews((prev) => [...prev, gifUrl]);
    setShowGifPicker(false); // Cerrar después de seleccionar
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []).filter(file => file.type.startsWith("image/"));
    
    if (files.length + selectedFiles.length + gifUrls.length > 4) {
      toast.error("Máximo 4 imágenes/GIFs permitidos");
      return;
    }
    
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFileOrGif = (indexToRemove) => {
    const previewUrl = previews[indexToRemove];
    const isGif = gifUrls.includes(previewUrl);

    setPreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    
    if (isGif) {
      // Remover de gifUrls
      setGifUrls((prev) => prev.filter((gif) => gif !== previewUrl));
    } else {
      // Remover de files y revocar URL
      URL.revokeObjectURL(previewUrl);
      // Hay que encontrar el File correspondiente. Esto requiere que el orden de `files` y `previews` para archivos sea el mismo.
      
      // Una forma más segura es usar un solo array de objetos { type: 'file'/'gif', src: '...', file: File | null }
      // Pero manteniendo la estructura actual, asumimos que los 'files' son los primeros en 'previews' que no son GIFs.
      const fileIndex = previews.slice(0, indexToRemove).filter(p => !gifUrls.includes(p)).length;

      setFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const resetForm = () => {
    // Revocar todas las URLs de blob de archivos antes de limpiar
    previews.forEach((p) => {
      if (!gifUrls.includes(p)) URL.revokeObjectURL(p);
    });
    
    setContent("");
    setFiles([]);
    setPreviews([]);
    setGifUrls([]);
    setLinkPreviewClosed(false);
    setLinkPreview(null);
    setLoading(false);
  };

  return {
    // Valores
    content, files, gifUrls, previews, loading, 
    showEmojiPicker, showGifPicker, linkPreview, linkPreviewClosed, debouncedContent,
    
    // Setters
    setContent, setLoading, setShowEmojiPicker, setShowGifPicker,
    setLinkPreview, setLinkPreviewClosed,
    
    // Handlers
    handleContentChange, addEmoji, handleFileChange, 
    handleGifSelect, removeFileOrGif, resetForm
  };
};