import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { supabaseClient } from "@/supabase/supabaseClient";
import { generateSlug } from "@/utils/blog/slugify";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus, ChevronLeft } from "lucide-react";
import { uploadToCloudinary } from "@/cloudinary/upToCloudinaryv2";
import { useIsMobile } from "@/hooks/useIsMobile";
import SaveButton from "./SaveButton";
import PublicButton from "./PublicButton";
import { notify } from "@/utils/toast/notifyv3";
import { validateTitle } from "@/utils/blog/validations";
import { contentErrors, imageErrors } from "@/consts/blog/errorMesages";
import { getMetadata } from "@/utils/blog/getMetadata";

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const CreateBlog = ({ isEditing = false }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();

  // Estados locales
  const [editor, setEditor] = useState(null);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null); // File (nuevo) o String (URL existente)
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll handler (modo compacto)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 1. QUERY: Cargar datos si estamos en modo edición
  const { data: blogData } = useQuery({
    queryKey: ["blog_edit", id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id, // Solo se ejecuta si hay un ID en la URL
  });

  // Sincronizar los datos del Query con el estado local y el editor
  useEffect(() => {
    if (blogData && editor) {
      setTitle(blogData.title);
      setImageFile(blogData.banner_url);
      setPreviewUrl(blogData.banner_url);
      editor.commands.setContent(blogData.content);
    }
  }, [blogData, editor]);

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 2. MUTATION: Guardar o Actualizar el Blog
  const saveMutation = useMutation({
    mutationFn: async ({ targetStatus, rawHtml }) => {
      let bannerUrl = previewUrl;

      // Si imageFile es un Objeto File (no un string de URL), lo subimos a Cloudinary
      if (imageFile && typeof imageFile !== "string") {
        const cloudinaryResponse = await uploadToCloudinary(
          imageFile,
          setUploadProgress
        );
        bannerUrl = cloudinaryResponse.secure_url;
      }

      const { readingTime, excerpt } = getMetadata(rawHtml);

      const blogPayload = {
        title,
        content: rawHtml,
        banner_url: bannerUrl,
        status: targetStatus,
        excerpt,
        reading_time: readingTime,
      };

      if (id) {
        // MODO EDICIÓN
        const { data, error } = await supabaseClient
          .from("blogs")
          .update(blogPayload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { data, targetStatus };
      } else {
        // MODO CREACIÓN
        const slug = `${generateSlug(title)}-${Math.random().toString(36).substring(2, 7)}`;
        const { data, error } = await supabaseClient
          .from("blogs")
          .insert([{ ...blogPayload, author_id: user.id, slug }])
          .select()
          .single();
        if (error) throw error;
        return { data, targetStatus };
      }
    },
    onSuccess: ({ data, targetStatus }) => {
      notify.success(
        targetStatus === "published"
          ? "¡Blog publicado con éxito!"
          : "Borrador guardado correctamente"
      );
      
      // Invalidar cachés para que las listas se actualicen
      queryClient.invalidateQueries({ queryKey: ["blogs_feed"] });
      queryClient.invalidateQueries({ queryKey: ["my_blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog_detail", data.slug] });

      // Redirigir
      navigate(targetStatus === "published" ? `/blog/my-blogs` : "/blog/my-blogs");
    },
    onError: (error) => {
      console.error("Error al guardar blog:", error);
      notify.error("Ocurrió un error al guardar el artículo");
    },
  });

  // Controlador de los botones de guardado
  const handleSave = (targetStatus = "published") => {
    if (!editor) return;
    
    const textContent = editor.getText().trim();
    const rawHtml = editor.getHTML();
    
    // Validaciones
    const errorTitle = validateTitle(title);
    if (errorTitle) return notify.error(errorTitle);
    
    if (!imageFile) return notify.error(random(imageErrors));
    if (!textContent) return notify.error(random(contentErrors));

    // Ejecutamos la mutación
    saveMutation.mutate({ targetStatus, rawHtml });
  };

  return (
    <div className="max-w-5xl mx-auto min-h-screen bg-white dark:bg-zinc-950 p-4 md:p-6 pb-24 md:pb-6">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 border-b border-zinc-100 dark:border-zinc-900 md:relative md:border-none md:bg-transparent">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-500">
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
              loading={saveMutation.isPending && saveMutation.variables.targetStatus === "draft"}
              onSave={() => handleSave("draft")}
              onDisable={saveMutation.isPending}
            />
            <PublicButton
              isMobile={isMobile}
              loading={saveMutation.isPending && saveMutation.variables.targetStatus === "published"}
              onPublic={() => handleSave("published")}
              onDisable={saveMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* INPUT TÍTULO */}
      <div className="mt-4 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Título del blog..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saveMutation.isPending}
          className="text-2xl md:text-5xl font-black bg-transparent border-none outline-none focus:ring-0 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 disabled:opacity-50"
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
            disabled={saveMutation.isPending}
          />
          <label
            htmlFor="banner-upload"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              saveMutation.isPending
                ? "text-zinc-300 cursor-not-allowed"
                : "text-zinc-500 hover:text-indigo-500 cursor-pointer"
            }`}
          >
            <ImagePlus size={20} />
            {previewUrl ? "Cambiar imagen de portada" : "Añadir imagen de portada"}
          </label>
        </div>
      </div>

      {/* PREVIEW DE IMAGEN */}
      {previewUrl && (
        <div className="relative my-4 rounded-2xl overflow-hidden h-[150px] md:h-[350px] border dark:border-zinc-800">
          <img src={previewUrl} className={`w-full h-full object-cover ${saveMutation.isPending && "opacity-50 blur-sm"}`} />
          {!saveMutation.isPending && (
            <label
              htmlFor="banner-upload"
              className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full text-white backdrop-blur-sm cursor-pointer hover:bg-black/70 transition"
            >
              <ImagePlus size={16} />
            </label>
          )}
        </div>
      )}

      {/* EDITOR TIPTAP */}
      <div className={`mt-2 md:mt-5 border-t border-zinc-100 dark:border-zinc-900 pt-4 ${saveMutation.isPending && "opacity-50 pointer-events-none"}`}>
        <SimpleEditor onEditorReady={setEditor} />
      </div>

    </div>
  );
};

export default CreateBlog;