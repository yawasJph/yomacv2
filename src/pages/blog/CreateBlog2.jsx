import React, { useState } from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { supabaseClient } from "@/supabase/supabaseClient";
import { generateSlug } from "@/utils/blog/slugify";
import { useAuth } from "@/context/AuthContext";

const CreateBlog2 = () => {
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(false)
  const {user} = useAuth()

  const title = "Blog-1"
  const banner = "banner-1"

  const handleSubmit = () => {
    handlePublish()
    //console.log(editor?.getHTML());
  };
  
  const handlePublish = async () => {
    // 1. Validaciones básicas
    if (!title || editor.isEmpty || !banner) {
      return alert("¡Ey! No olvides el título, el contenido y la portada.");
    }

    setLoading(true);

    try {
      // 2. Preparar el objeto (El contenido es HTML puro de Tiptap)
      const rawHtml = editor.getHTML();
      const slug = `${generateSlug(title)}-${Math.random().toString(36).substring(2, 7)}`;

      // 3. Insertar en Supabase
      const { data, error } = await supabaseClient
        .from("blogs")
        .insert([
          {
            author_id: user?.id,
            title,
            content: rawHtml, // Guardamos el HTML
            slug,
            banner_url: banner,
            status: "published",
            excerpt: "prueba",
            reading_time: 15
          },
        ])
        .select();
      if (error) throw error;

      console.log(data)

      alert("¡Blog publicado con éxito!");
      // Redirigir al usuario al blog recién creado o al feed
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Hubo un problema al publicar.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="text-black dark:text-white flex justify-between mx-3">
        <h1 className=" p-5">Crear Blog</h1>
        <button className="" onClick={handleSubmit} disabled={loading}>
          Publicar
        </button>
      </div>

      <SimpleEditor onEditorReady={setEditor} />
    </div>
  );
};

export default CreateBlog2;
