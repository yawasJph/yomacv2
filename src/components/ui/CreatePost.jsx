import React, { useState } from "react";
import { Image, X, ImagePlay} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabaseClient } from "../../supabase/supabaseClient";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react";
import GifPicker from "../utils/GifPicker";


const CreatePost = () => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]); // imágenes reales
  const [gifUrls, setGifUrls] = useState([]); // GIFs de Tenor
  const [previews, setPreviews] = useState([]); // preview mixto
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [linkPreview, setLinkPreview] = useState(null);
  const [linkPreviewClosed, setLinkPreviewClosed] = useState(false);


  const handleCloseLinkPreview = () => {
    setLinkPreview(null);
    setLinkPreviewClosed(true); // marca que el usuario lo cerró manualmente
  };

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const handleContentChange = async (e) => {
    const text = e.target.value;
    setContent(text);

    const urls = text.match(urlRegex);

    // Si no hay URL → borrar preview y permitir mostrarlo otra vez
    if (!urls) {
      setLinkPreview(null);
      setLinkPreviewClosed(false);
      return;
    }

    // Si el usuario cerró manualmente el preview, no volver a mostrarlo
    if (linkPreviewClosed) return;

    if (!urls) {
      setLinkPreview(null);
      return;
    }

    const url = urls[0];

    try {
      const res = await fetch(`https://api.microlink.io/?url=${url}`);
      const data = await res.json();
      // const { data, error } = await supabaseClient.functions.invoke(
      //   "og",
      //   { body: { url } }
      // );
      if (data?.data) {
        setLinkPreview({
          url,
          title: data.data.title,
          description: data.data.description,
          image: data.data.image?.url,
          logo: data.data.logo?.url,
          publisher: data.data?.publisher
        });
        
      }
    } catch (error) {
      console.error("Error cargando link preview:", error);
    }
  };
  console.log(linkPreview)
  // Agregar emoji al texto
  const addEmoji = (emojiData) => {
    const emoji = emojiData.emoji;
    setContent((prev) => prev + emoji);
  };

  // Maneja selección de múltiples imágenes
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validar cantidad máxima (6 imágenes)
    if (files.length + selectedFiles.length > 4) {
      toast.error("Máximo 4 imágenes permitidas");
      return;
    }

    // Filtrar solo imágenes
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    // Crear previews para las nuevas imágenes
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));

    setFiles((prev) => [...prev, ...imageFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remover imagen específica
  const removeImage = (index) => {
    const isGif = gifUrls.includes(previews[index]);

    if (isGif) {
      setGifUrls((prev) => prev.filter((gif) => gif !== previews[index]));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    URL.revokeObjectURL(previews[index]);

    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remover todas las imágenes
  const removeAllImages = () => {
    previews.forEach((p) => {
      if (!gifUrls.includes(p)) URL.revokeObjectURL(p);
    });

    setFiles([]);
    setPreviews([]);
    setGifUrls([]);
  };

  const handleSubmit = async () => {
    if (!content.trim() && previews.length === 0) {
      toast.error("Escribe algo o sube una imagen");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Crear el post
      const { data: post, error: postError } = await supabaseClient
        .from("posts")
        .insert({
          user_id: user.id,
          content: content,
          og_data: linkPreview 
        })
        .select("id")
        .single();

      if (postError) throw postError;

      const postId = post.id;

      // 2️⃣ Subir imágenes al bucket S3-like (máximo 6)
      const imageUrls = [];

      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `post-${postId}/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
          .from("posts")
          .upload(filePath, file, {
            contentType: file.type,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseClient.storage
          .from("posts")
          .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        imageUrls.push(imageUrl);
      }

      // Agregar GIFs (no requieren subida)
      gifUrls.forEach((gif) => imageUrls.push(gif));

      // 3️⃣ Insertar URLs en la tabla post_images
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

      // 4️⃣ Limpiar formulario
      setContent("");
      previews.forEach((p) => {
        if (!gifUrls.includes(p)) URL.revokeObjectURL(p);
      });
      setFiles([]);
      setPreviews([]);
      setGifUrls([]);
      setLinkPreviewClosed(false);
      setLinkPreview(null);

      toast.success("¡Publicado!");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al publicar");
    }

    setLoading(false);
  };

  // Guardar GIF seleccionado
  const handleGifSelect = (gifUrl) => {
    if (previews.length >= 4) {
      toast.error("Máximo 4 archivos por post");
      return;
    }

    setGifUrls((prev) => [...prev, gifUrl]);
    setPreviews((prev) => [...prev, gifUrl]);
  };

  // Función para renderizar grid de imágenes basado en la cantidad
  const renderImageGrid = (images, isPreview = false) => {
    if (images.length === 0) return null;

    const gridClass =
      {
        1: "grid-cols-1",
        2: "grid-cols-2 gap-2",
        3: "grid-cols-2 gap-2",
        4: "grid-cols-2 gap-2",
        5: "grid-cols-3 gap-2",
        6: "grid-cols-3 gap-2",
      }[images.length] || "grid-cols-2 gap-1";

    return (
      <div className={`grid ${gridClass} mt-3`}>
        {images.map((preview, index) => (
          <div
            key={index}
            className={`relative ${
              images.length === 3 && index === 0 ? "col-span-2 row-span-2" : ""
            } ${images.length === 4 && index >= 2 ? "col-span-1" : ""}`}
          >
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className={`w-full rounded-lg object-cover ${
                images.length === 1
                  ? "max-h-96"
                  : images.length === 2
                  ? "h-48"
                  : images.length === 3 && index === 0
                  ? "h-64"
                  : "h-32"
              } ${isPreview ? "cursor-default" : "cursor-pointer"}`}
            />
            {!isPreview && (
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full cursor-pointer transition-all"
                title="quitar imagen"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="bg-white dark:bg-black border-b border-emerald-500/10 dark:border-emerald-500/20 px-4 py-4 sm:px-6">
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={user.user_metadata.avatar_url || "/default-avatar.jpg"}
          alt={user.user_metadata.full_name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
        />

        {/* Formulario */}
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            //onChange={(e) => setContent(e.target.value)}
            onChange={handleContentChange}
            placeholder="Iniciar un hilo..."
            rows={4}
            className="w-full resize-none bg-transparent border-none outline-none text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 "
          />

          {/* Acciones */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-emerald-500/10 dark:border-emerald-500/20">
            <div className="flex items-center gap-2">
              <label
                className={`text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20 ${
                  previews.length >= 4 || linkPreview
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title={
                  previews.length >= 4 ? "Máximo 4 imágenes" : "subir imagen"
                }
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
                className={`text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20 ${
                  previews.length >= 4 || linkPreview
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title="Agregar GIF"
                disabled={previews.length >= 4 || linkPreview}
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

              {/* Botón Emoji */}
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
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && previews.length === 0)}
              className="px-5 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
            >
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>

      {/* LINK PREVIEW */}
      {linkPreview && (
        <div className="relative mt-8">
          {/* Botón cerrar */}
          <button
            onClick={handleCloseLinkPreview}
            className="absolute top-2 right-2 bg-black/30 p-1 text-white rounded-full z-20"
          >
            <X size={14} />
          </button>
          <a
            href={linkPreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 mb-4"
          >
            {/* Izquierda: Texto */}
            <div className="flex-1 p-3 flex flex-col justify-center">
              {linkPreview.publisher && (
                <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1 line-clamp-1">
                  {linkPreview.publisher}
                </p>
              )}

              {linkPreview.title && (
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">
                  {linkPreview.title}
                </h3>
              )}

              {linkPreview.description && (
                <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mt-1">
                  {linkPreview.description}
                </p>
              )}

              {linkPreview.url && (
                <div className="flex items-center gap-2 mt-2">
                  {linkPreview.logo && (
                    <img
                      src={linkPreview.logo}
                      className="w-4 h-4 rounded-sm"
                    />
                  )}
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {new URL(linkPreview.url).hostname}
                  </span>
                </div>
              )}
            </div>

            {/* Derecha: Imagen */}
            {linkPreview.image && (
              <div className="w-30 md:w-44 min-h-24  shrink-0 bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                {/**md:h-24 */}
                <img
                  src={linkPreview.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </a>
        </div>
      )}

      {/* Imágenes seleccionadas */}
      {previews.length > 0 && (
        <div className="mt-8">
          {renderImageGrid(previews)}

          {/* Contador y botón para eliminar todas */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {previews.length}/4 imágenes
            </span>
            <button
              onClick={removeAllImages}
              className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Eliminar todas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
