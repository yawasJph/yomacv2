import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabaseClient } from "@/supabase/supabaseClient";
import ReadOnlyEditor from "@/components/tiptap-templates/simple/ReadOnlyEditor";   

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("blogs")
          .select(`
            *,
            author:author_id (
              id,
              full_name,
              avatar,
              carrera
            )
          `) // Traemos los datos del autor
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
  if (!post) return <div className="py-20 text-center">Blog no encontrado</div>;

  return (
    <article className="bg-white dark:bg-zinc-950 pb-20">
      <header className="max-w-4xl mx-auto pt-16 px-6">
        <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white mb-8 text-center leading-tight">
          {post.title}
        </h1>

        {/* --- INFO DEL AUTOR SUPERIOR --- */}
        <div className="flex items-center justify-center gap-4 mb-10 border-y border-zinc-100 dark:border-zinc-800 py-6">
          <img 
            src={post.author?.avatar || '/default-avatar.png'} 
            className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
            alt={post.author?.full_name}
          />
          <div className="flex flex-col text-left">
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">
              {post.author?.full_name}
            </span>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>{post.reading_time} min lectura</span>
            </div>
          </div>
        </div>

        <img
          src={post.banner_url}
          className="w-full aspect-video object-cover rounded-3xl shadow-2xl mb-12"
          alt={post.title}
        />
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-12 w-full">
        <ReadOnlyEditor content={post.content}/>
        
        {/* --- BIO DEL AUTOR AL FINAL --- */}
        <footer className="mt-10 p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-6">
          <img 
            src={post.author?.avatar || '/default-avatar.png'} 
            className="w-24 h-24 rounded-2xl object-cover"
            alt={post.author?.full_name}
          />
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-1">Escrito por</p>
            <h4 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              {post.author?.full_name}
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Estudiante de <span className="text-emerald-500">{post.author?.carrera || 'Arévalo'}</span>. 
              Apasionado por compartir conocimientos y crear comunidad en el instituto.
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default BlogDetail;