import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
          .select(
            `
            *,
            author:author_id (
              id,
              full_name,
              avatar,
              carrera,
              ciclo,
              username
            )
          `,
          ) // Traemos los datos del autor
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
            src={post.author?.avatar || "/default-avatar.png"}
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
        <ReadOnlyEditor content={post.content} />

        <footer className="mt-12 relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 group transition-all hover:shadow-xl hover:shadow-emerald-500/10">
          {/* Glow decorativo */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-linear-to-r from-emerald-500/10 via-transparent to-indigo-500/10 pointer-events-none" />

          {/* Avatar */}
          <div className="relative">
            <img
              src={post.author?.avatar || "/default-avatar.png"}
              alt={post.author?.full_name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-zinc-900 shadow-lg"
            />

            {/* Badge online / decorativo */}
            {/* <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" /> */}
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-2">
              ✍️ Escrito por
            </p>

            <h4 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              {post.author?.full_name}
            </h4>

            {post.author?.carrera && (
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Estudiante de{" "}
                <span className="text-emerald-500 font-medium">
                  {post.author?.carrera}
                </span>{" "}
                • Ciclo{" "}
                <span className="text-indigo-500 font-medium">
                  {post.author?.ciclo || "—"}
                </span>
              </p>
            )}

            {/* CTA opcional */}
            <div className="mt-4 flex justify-center md:justify-start gap-3">
              <Link to={`/profile/@${post.author.username}`} className="text-xs px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition">
                Ver perfil 👀
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default BlogDetail;
