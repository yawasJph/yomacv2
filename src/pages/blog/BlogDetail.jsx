import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabaseClient } from "@/supabase/supabaseClient";
import Prism from "prismjs";

import "prismjs/themes/prism-tomorrow.css";
// Lenguajes (Asegúrate de que existan en node_modules)
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-clike"; // Base para java, c++, etc.
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup"; // Para HTML
import "prismjs/components/prism-sql"; // Para HTML
import "highlight.js/styles/github-dark.css";

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (post) {
      const timer = setTimeout(() => {
        const codeBlocks = document.querySelectorAll("pre");

        codeBlocks.forEach((pre) => {
          // 1. Evitar duplicar botones si el efecto se vuelve a ejecutar
          if (pre.parentElement.classList.contains("code-wrapper")) return;

          // 2. Crear contenedor relativo
          const wrapper = document.createElement("div");
          wrapper.className = "code-wrapper relative group";
          pre.parentNode.insertBefore(wrapper, pre);
          wrapper.appendChild(pre);

          // 3. Crear el botón
          const copyBtn = document.createElement("button");
          copyBtn.innerHTML = "Copiar";
          // Clases de Tailwind para el botón
          copyBtn.className = `
          absolute top-3 right-3 z-30
          opacity-0 group-hover:opacity-100 
          bg-zinc-800/80 hover:bg-zinc-700 
          text-zinc-300 hover:text-white 
          text-[10px] font-bold uppercase 
          px-3 py-1.5 rounded-md border border-zinc-700
          transition-all duration-200 cursor-pointer
        `;

          // 4. Lógica de copiar
          copyBtn.addEventListener("click", async () => {
            const code = pre.querySelector("code").innerText;
            try {
              await navigator.clipboard.writeText(code);
              copyBtn.innerHTML = "¡Copiado!";
              copyBtn.classList.add("bg-green-600/50", "text-white");

              setTimeout(() => {
                copyBtn.innerHTML = "Copiar";
                copyBtn.classList.remove("bg-green-600/50", "text-white");
              }, 2000);
            } catch (err) {
              console.error("Error al copiar:", err);
            }
          });

          wrapper.appendChild(copyBtn);

          // 5. Resaltar con Prism
          const code = pre.querySelector("code");
          if (code) {
            if (!code.className.includes("language-")) {
              code.classList.add("language-javascript");
            }
            Prism.highlightElement(code);
          }
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("blogs")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="py-20 text-center">Cargando...</div>;
  if (!post) return <div className="py-20 text-center">Post no encontrado</div>;

  return (
    <article className="min-h-screen bg-white dark:bg-zinc-950 pb-20">
      {/* Header del Blog */}
      <header className="max-w-4xl mx-auto pt-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white mb-6">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-zinc-500 mb-10">
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>{post.reading_time} min lectura</span>
        </div>
        <img
          src={post.banner_url}
          className="w-full aspect-video object-cover rounded-2xl shadow-2xl"
          alt={post.title}
        />
      </header>

      {/* CONTENIDO RENDERIZADO */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-12 overflow-hidden w-full">
        <div className="prose lg:prose-xl dark:prose-invert max-w-none w-full">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;
