import React, { use, useEffect, useState } from "react";
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
import { ChevronLeft } from "lucide-react";
import { notify } from "@/utils/toast/notifyv3";
import { validateTitle } from "@/utils/blog/validations";

const imageErrors = [
  "Sin portada esto parece tarea sin nombre 🥲",
  "Tu post está calato… ponle una imagen 🖼️😳",
  "Ni Netflix deja contenido sin portada 😤",
  "Una portada no te cuesta nada… bueno sí, creatividad 😅",
];

const contentErrors = [
  "Hermano… tu contenido está más vacío que mi billetera 😭",
  "Escribe algo pues 😐 aunque sea 'primer blog'",
  "Contenido no encontrado… pero esta vez es tu culpa 😬",
  "Contenido 404 , Ni un emoji… ¿todo bien en casa? 😳",
  "Sin contenido. Esto no es minimalismo, es abandono 🫠",
];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Función para calcular tiempo de lectura y resumen
const getMetadata = (html) => {
  const text = html.replace(/<[^>]*>/g, ""); // Quitar etiquetas HTML
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / 200); // Promedio 200 palabras x min
  const excerpt = text.substring(0, 150) + "..."; // Primeros 150 caracteres
  return { readingTime, excerpt };
};

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

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Si bajamos más de 100px, activamos el modo compacto
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (id) {
      const fetchBlogData = async () => {
        const { data } = await supabaseClient
          .from("blogs")
          .select("*")
          .eq("id", id)
          .single();

        if (data && editor) {
          setTitle(data.title);
          setImageFile(data.banner_url);
          setPreviewUrl(data.banner_url);
          editor.commands.setContent(data.content); // Tiptap carga el HTML
        }
      };
      if (editor) fetchBlogData();
    }
  }, [id, editor]);

  // Manejar selección de imagen (Localmente)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Crea una URL temporal para ver la foto
    }
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
    // if (!title || !editor || editor.isEmpty || !imageFile) {
    //   return notify.error(
    //     "Por favor completa el título, contenido y selecciona una imagen de portada.",
    //   );
    // }
    const content = editor.getText().trim();
    const erroTitle = validateTitle(title);

    if (erroTitle) return notify.error(erroTitle);
    if (!imageFile) {
      return notify.error(random(imageErrors));
    }
    if (!content) {
      return notify.error(random(contentErrors));
    }

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
    // Cambiamos p-6 por p-4 en móvil y usamos dvh
    <div className="max-w-5xl mx-auto min-h-screen bg-white dark:bg-zinc-950 p-4 md:p-6 pb-24 md:pb-6">
      {/* HEADER: En móvil lo hacemos más compacto y sticky si es necesario */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 border-b border-zinc-100 dark:border-zinc-900 md:relative md:border-none md:bg-transparent">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-zinc-500"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-lg md:text-2xl font-bold dark:text-white truncate">
              {id ? "Editar Artículo" : "Nuevo Artículo"}
            </h1>
          </div>

          <div className="flex gap-2">
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
      </div>

      {/* INPUT TÍTULO: Reducimos tamaño en móvil para ganar espacio vertical */}
      <div className="mt-4 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Título del blog..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl md:text-5xl font-black bg-transparent border-none outline-none focus:ring-0 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
        />
        <p className="text-xs text-end text-zinc-500">
          {title.trim().length}/100
        </p>

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
            {previewUrl
              ? "Cambiar imagen de portada"
              : "Añadir imagen de portada"}
          </label>
        </div>
      </div>

      {/* PREVIEW DE IMAGEN: En móvil la hacemos más pequeña para que no empuje el editor hacia abajo */}
      {previewUrl && (
        <div className="relative my-4 rounded-2xl overflow-hidden h-[150px] md:h-[350px] border dark:border-zinc-800">
          <img src={previewUrl} className="w-full h-full object-cover" />
          <label
            htmlFor="banner-img"
            className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full text-white backdrop-blur-sm"
          >
            <ImagePlus size={16} />
          </label>
        </div>
      )}

      {/* EDITOR: Aquí está el truco para el teclado */}
      <div className="mt-2 md:mt-5 border-t border-zinc-100 dark:border-zinc-900 pt-4">
        <SimpleEditor onEditorReady={setEditor} />
      </div>

      {/* ESPACIADOR PARA EL TECLADO: Evita que el teclado tape el final del texto */}
      {/* <div className="h-40 md:hidden" /> */}
    </div>
  );
};

export default CreateBlog;
