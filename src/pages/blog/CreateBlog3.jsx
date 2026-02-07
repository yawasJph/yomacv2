import React, { useState } from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { supabaseClient } from "@/supabase/supabaseClient";
import { generateSlug } from "@/utils/blog/slugify";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateBlog2 = () => {
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [banner, setBanner] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Función para calcular tiempo de lectura y resumen
  const getMetadata = (html) => {
    const text = html.replace(/<[^>]*>/g, ""); // Quitar etiquetas HTML
    const words = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Promedio 200 palabras x min
    const excerpt = text.substring(0, 150) + "..."; // Primeros 150 caracteres
    return { readingTime, excerpt };
  };

  const handlePublish = async () => {
    if (!title || !editor || editor.isEmpty || !banner) {
      return alert("¡Ey! Título, contenido y banner son obligatorios.");
    }

    setLoading(true);

    try {
      const rawHtml = editor.getHTML();
      const { readingTime, excerpt } = getMetadata(rawHtml);
      const slug = `${generateSlug(title)}-${Math.random().toString(36).substring(2, 7)}`;

      const { data, error } = await supabaseClient
        .from("blogs")
        .insert([
          {
            author_id: user?.id,
            title,
            content: rawHtml,
            slug,
            banner_url: banner,
            status: "published",
            excerpt: excerpt,
            reading_time: readingTime
          },
        ])
        .select()
        .single();

      if (error) throw error;

      alert("¡Blog publicado con éxito!");
      navigate(`/blog/${data.slug}`); // Redirigir al detalle del blog
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Hubo un problema al publicar.");
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
          <button 
            onClick={handlePublish}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            {loading ? "Publicando..." : "Publicar Ahora"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Título del blog..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl md:text-5xl font-black bg-transparent border-none outline-none focus:ring-0 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 max-w-90 md:max-w-full"
        />

        <input
          type="text"
          placeholder="URL del Banner (ej: https://images.unsplash.com/...)"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          className="text-sm bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg outline-none dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
        />
      </div>

      {/* Preview del Banner */}
      {banner && (
        <div className="mb-8 rounded-2xl overflow-hidden h-48 w-full border border-zinc-200 dark:border-zinc-800">
          <img src={banner} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Editor Tiptap */}
      <div className="border-t border-zinc-100 dark:border-zinc-900 pt-8">
        <SimpleEditor onEditorReady={setEditor} />
      </div>
    </div>
  );
};

export default CreateBlog2;