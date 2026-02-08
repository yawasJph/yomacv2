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
import "prismjs/components/prism-icon"; // Para HTML
import "prismjs/components/prism-json"; // Para HTML
import "prismjs/components/prism-jsx"; // Para HTML
import "prismjs/components/prism-plsql"; // Para HTML
//import "highlight.js/styles/github-dark.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
// Si quieres el JS del plugin (opcional, pero ayuda)
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import { toast } from "sonner";

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (post) {
    const timer = setTimeout(() => {
      const codeBlocks = document.querySelectorAll('pre');

      codeBlocks.forEach((pre) => {
        if (pre.parentElement.classList.contains('code-wrapper')) return;

        // 1. Envolver el pre
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper relative group my-8 overflow-hidden rounded-xl border border-zinc-800 bg-[#1d1f21] shadow-2xl';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        // 2. Extraer el lenguaje (ej: "language-javascript" -> "javascript")
        const codeElement = pre.querySelector('code');
        let langName = 'code';
        if (codeElement) {
          const langClass = Array.from(codeElement.classList).find(c => c.startsWith('language-'));
          if (langClass) langName = langClass.replace('language-', '');
        }

        // 3. Crear Etiqueta de Lenguaje (Izquierda)
        const langBadge = document.createElement('span');
        langBadge.innerHTML = langName.toUpperCase();
        langBadge.className = `
          absolute top-3 left-4 z-30
          text-[12px] md:text-[15px] font-black tracking-widest text-zinc-500
          pointer-events-none select-none  
        `;
        wrapper.appendChild(langBadge);

        // 4. Crear Botón de Copiar (Derecha)
        const copyBtn = document.createElement('button');
        const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        
        copyBtn.innerHTML = iconCopy;
        copyBtn.className = `
          absolute top-2.5 right-3 z-30
          opacity-0 group-hover:opacity-100 
          bg-zinc-800/50 hover:bg-zinc-700 
          text-zinc-400 hover:text-white 
          p-2 rounded-lg border border-zinc-700/50
          transition-all duration-200 cursor-pointer backdrop-blur-md
        `;

        // 5. Acción de copiar
        copyBtn.addEventListener('click', async () => {
          const code = codeElement.innerText;
          try {
            await navigator.clipboard.writeText(code);
            copyBtn.innerHTML = iconCheck;
            copyBtn.classList.add('text-green-400', 'border-green-500/50', 'bg-green-500/10');
            toast.info("copiado")
            setTimeout(() => {
              
              copyBtn.innerHTML = iconCopy;
              copyBtn.classList.remove('text-green-400', 'border-green-500/50', 'bg-green-500/10');
            }, 2000);

          } catch (err) { console.error(err); }
        });

        wrapper.appendChild(copyBtn);

        pre.classList.add('line-numbers'); 
        // Forzar que el contador de líneas se resetee
        pre.style.counterReset = "linenumber";

        // 6. Ejecutar Prism
        if (codeElement) {
          if (!codeElement.className.includes('language-')) {
            codeElement.classList.add('language-javascript');
          }
          Prism.highlightElement(codeElement);
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
