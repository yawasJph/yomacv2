import React, { useEffect, useState } from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { supabaseClient } from "@/supabase/supabaseClient";
import { generateSlug } from "@/utils/blog/slugify";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { uploadToCloudinary } from "@/cloudinary/upToCloudinaryv2";
import { useIsMobile } from "@/hooks/useIsMobile";
import SaveButton from "./SaveButton";
import PublicButton from "./PublicButton";

const CreateBlog = ({ isEditing = false }) => {
  const { user } = useAuth();
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const isMobile = useIsMobile();
  const { id } = useParams();

  // Estados para la imagen
  const [imageFile, setImageFile] = useState(null); // Archivo crudo (File)
  const [previewUrl, setPreviewUrl] = useState(""); // Solo para mostrar en UI
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogData = async () => {
      const { data, error } = await supabaseClient
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (data && editor) {
        setTitle(data.title);
        setPreviewUrl(data.banner_url);
        editor.commands.setContent(data.content); // Tiptap carga el HTML
      }
    };
    if (editor) fetchBlogData();
  }, [id, editor]);

  // Manejar selección de imagen (Localmente)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Crea una URL temporal para ver la foto
    }
  };

  // Función para calcular tiempo de lectura y resumen
  const getMetadata = (html) => {
    const text = html.replace(/<[^>]*>/g, ""); // Quitar etiquetas HTML
    const words = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Promedio 200 palabras x min
    const excerpt = text.substring(0, 150) + "..."; // Primeros 150 caracteres
    return { readingTime, excerpt };
  };

  //   const handlePublish = async (targetStatus = "published") => {
  //     if (!title || !editor || editor.isEmpty || !imageFile) {
  //       return alert(
  //         "Por favor completa el título, contenido y selecciona una imagen de portada.",
  //       );
  //     }

  //     setLoading(true);
  //     setUploadProgress(0);

  //     try {
  //       const cloudinaryResponse = await uploadToCloudinary(
  //         imageFile,
  //         (progress) => {
  //           setUploadProgress(progress);
  //         },
  //       );
  //       const bannerUrl = cloudinaryResponse.secure_url;

  //       const rawHtml = editor.getHTML();
  //       const { readingTime, excerpt } = getMetadata(rawHtml);
  //       const slug = `${generateSlug(title)}-${Math.random().toString(36).substring(2, 7)}`;

  //       const { data, error } = await supabaseClient
  //         .from("blogs")
  //         .insert([
  //           {
  //             author_id: user?.id,
  //             title,
  //             content: rawHtml,
  //             slug,
  //             banner_url: bannerUrl,
  //             status: targetStatus,
  //             excerpt: excerpt,
  //             reading_time: readingTime,
  //           },
  //         ])
  //         .select()
  //         .single();

  //       if (error) throw error;

  //       alert("¡Blog publicado con éxito!");
  //       navigate(`/blog/${data.slug}`);
  //     } catch (err) {
  //       console.error("Error al guardar:", err);
  //       alert("Hubo un problema al publicar.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const handleSave = async (targetStatus = "published") => {
    setLoading(true);
    try {
      let bannerUrl = previewUrl;

      // 1. Solo subir a Cloudinary si el usuario seleccionó un archivo nuevo
      if (imageFile) {
        const cloudinaryResponse = await uploadToCloudinary(
          imageFile,
          setUploadProgress,
        );
        bannerUrl = cloudinaryResponse.secure_url;
      }

      const rawHtml = editor.getHTML();
      const { readingTime, excerpt } = getMetadata(rawHtml);

      const blogData = {
        title,
        content: rawHtml,
        banner_url: bannerUrl,
        status: targetStatus,
        excerpt,
        reading_time: readingTime,
      };

      let result;
      if (id) {
        // MODO EDICIÓN
        result = await supabaseClient
          .from("blogs")
          .update(blogData)
          .eq("id", id)
          .select()
          .single();
      } else {
        // MODO CREACIÓN
        result = await supabaseClient
          .from("blogs")
          .insert([
            {
              ...blogData,
              author_id: user.id,
              slug: `${generateSlug(title)}-${Math.random().toString(36).substring(2, 7)}`,
            },
          ])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      navigate(
        targetStatus === "published"
          ? `/blog/${result.data.slug}`
          : "/blog/my-blogs",
      );
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-5xl mx-auto min-h-screen bg-white dark:bg-zinc-950 p-6">
      {/* Header con Inputs */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold dark:text-white">Nuevo Artículo</h1>

          <div className="flex gap-3">
            <SaveButton
              isMobile={isMobile}
              loading={loading}
              onSave={() => handleSave("draft")}
            />
            <PublicButton
              isMobile={isMobile}
              loading={loading}
              onPublic={() => handleSave("published")}
            />
          </div>
        </div>

        <input
          type="text"
          placeholder="Título del blog..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl md:text-5xl font-black bg-transparent border-none outline-none focus:ring-0 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 max-w-85 md:max-w-full"
        />

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="banner-upload"
          />
          <label
            htmlFor="banner-upload"
            className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-500 hover:text-indigo-500 transition-colors"
          >
            <ImagePlus size={20} />
            {imageFile && previewUrl
              ? "Cambiar imagen de portada"
              : "Añadir imagen de portada"}
          </label>
        </div>
      </div>

      {loading && uploadProgress > 0 && (
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${uploadProgress}%` }}
          />
          <p className="text-[10px] text-zinc-500 mt-1 font-bold">
            {uploadProgress < 100
              ? `SUBIENDO IMAGEN: ${uploadProgress}%`
              : "PROCESANDO ARTÍCULO..."}
          </p>
        </div>
      )}

      {previewUrl && (
        <div className="relative mb-10 rounded-3xl overflow-hidden h-[350px] border dark:border-zinc-800 shadow-xl">
          <img
            src={previewUrl}
            className={`w-full h-full object-cover transition-opacity ${loading ? "opacity-40" : "opacity-100"}`}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
      )}

      {/* Editor Tiptap */}
      <div className="border-t border-zinc-100 dark:border-zinc-900 pt-5">
        <SimpleEditor onEditorReady={setEditor} />
      </div>
    </div>
  );
};

export default CreateBlog;
