// 📄 components/CreatePost.jsx (Refactorizado)
import React, { useEffect } from "react";
import { Image, ImagePlay, Smile } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import GifPicker from "../utils/GifPicker";
import { usePostState } from "../../hooks/usePostState"; // 👈 Nuevo Hook de Estado
import { useLinkPreview } from "../../hooks/useLinkPreview2"; // 👈 Nuevo Hook de Preview
import { usePostCreation } from "../../hooks/usePostCreation"; // 👈 Nuevo Hook de Creación
import LinkPreviewCard from "../ui/CreatePost/LinkPreviewCard"; // 👈 Nuevo Componente
import PostMediaGrid from "../ui/CreatePost/PostMediaGrid"; // 👈 Nuevo Componente

const CreatePost = () => {
  const { user } = useAuth();
  const { createPost } = usePostCreation();
  
  // 1. Lógica de Estado (del formulario)
  const {
    content, files, gifUrls, previews, loading, 
    showEmojiPicker, showGifPicker, linkPreview, linkPreviewClosed, debouncedContent,
    setContent, setLoading, setShowEmojiPicker, setShowGifPicker, 
    setLinkPreview, setLinkPreviewClosed, removeFileOrGif, resetForm,
    handleContentChange, addEmoji, handleFileChange, handleGifSelect
  } = usePostState();
  
  // 2. Lógica de Link Preview (usando Tanstack Query)
  const { data: ogData, isLoading: isPreviewLoading, isError: isPreviewError, foundUrl } = useLinkPreview(
    debouncedContent, 
    linkPreviewClosed
  );

  // 3. Efecto para sincronizar el estado del Link Preview con el hook de Query
  useEffect(() => {
    // Si la URL desaparece, limpiamos el preview (y no volvemos a intentar)
    if (!foundUrl) {
      setLinkPreview(null);
      return;
    }
    
    // Si la query trae datos, actualizamos el estado.
    if (ogData) {
      setLinkPreview(ogData);
      setLinkPreviewClosed(false); // Si hay nueva data, asumimos que debe mostrarse
    }

    // Si la query falla (isError), limpiamos y bloqueamos para no reintentar automáticamente
    if (isPreviewError) {
      setLinkPreview(null);
      setLinkPreviewClosed(true); 
    }

  }, [ogData, foundUrl, isPreviewError, setLinkPreview, setLinkPreviewClosed]);
  
  const handleCloseLinkPreview = () => {
    setLinkPreview(null);
    setLinkPreviewClosed(true); // Bloquear futuras búsquedas hasta que el usuario escriba otro link o borre todo
  };

  const handleCreatePost = () => {
      createPost({ user, content, files, gifUrls, linkPreview, resetForm, setLoading });
  };

  const isSubmitDisabled = 
      loading || isPreviewLoading || (!content.trim() && previews.length === 0);

  return (
    <div className="bg-white dark:bg-black border-b border-emerald-500/10 dark:border-emerald-500/20 px-4 py-4 sm:px-6">
      <div className="flex gap-3">
        {/* Avatar */}
        {/* ... (Tu JSX de avatar) ... */}
        <img
          src={user.user_metadata.avatar_url || "/default-avatar.jpg"}
          alt={user.user_metadata.full_name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
        />

        {/* Formulario */}
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Iniciar un hilo..."
            rows={4}
            className="w-full resize-none bg-transparent border-none outline-none text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 "
          />
          
          {/* Acciones e Input de Archivos */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-emerald-500/10 dark:border-emerald-500/20">
            <div className="flex items-center gap-2">
              <label
                className={`text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20 ${
                  previews.length >= 4 || linkPreview ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={previews.length >= 4 ? "Máximo 4 archivos" : "subir imagen"}
              >
                <Image size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                  disabled={previews.length >= 4 || linkPreview}
                />
              </label>

              <button
                // Lógica de GIF
                // ... (similar al input de archivo, pero llama a setShowGifPicker) ...
                className={`text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20 ${
                  previews.length >= 4 || linkPreview ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (previews.length >= 4 || linkPreview) return;
                  setShowGifPicker(true);
                }}
              >
                <ImagePlay size={20} />
              </button>

              {showGifPicker && (
                <GifPicker
                  onSelect={handleGifSelect}
                  onClose={() => setShowGifPicker(false)}
                />
              )}

              {/* Botón y Picker de Emoji */}
              {/* ... (Tu JSX de EmojiPicker) ... */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                  title="Agregar emoji"
                >
                  <Smile size={20} />
                </button>

                {showEmojiPicker && (
                  <div className="absolute z-50 mt-3 -left-32 md:left-0">
                    {" "}
                    {/**-right-45 */}
                    <EmojiPicker
                      onEmojiClick={addEmoji}
                      theme={
                        document.documentElement.classList.contains("dark")
                          ? "dark"
                          : "light"
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCreatePost}
              disabled={isSubmitDisabled}
              className="px-5 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
            >
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>
          
        

        </div>
      </div>

                  {/* Tarjeta de Preview */}
          <LinkPreviewCard 
            preview={linkPreview} 
            isLoading={isPreviewLoading} 
            onClose={handleCloseLinkPreview} 
          />

          {/* Grilla de Imágenes/GIFs */}
          <PostMediaGrid 
            previews={previews} 
            removeFileOrGif={removeFileOrGif}
            removeAllImages={resetForm} // Reusa resetForm si quieres que también limpie el texto
          />
    </div>
  );
};

export default CreatePost;