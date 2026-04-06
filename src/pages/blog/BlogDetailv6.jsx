import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/supabase/supabaseClient";
import ReadOnlyEditor from "@/components/tiptap-templates/simple/ReadOnlyEditor";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // QUERY: Obtener los detalles del blog por su slug
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blog_detail", slug],
    queryFn: async () => {
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
        )
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug, // Solo ejecuta si el slug existe
    staleTime: 1000 * 60 * 5, // Caché fresca por 5 minutos: evita peticiones repetidas al navegar "Atrás"
    retry: 1, // Si falla (ej. slug no existe), solo reintenta 1 vez rápido
  });

  const handleShare = async () => {
    // Construimos la URL usando tu nuevo redirect
    const shareUrl = `${window.location.origin}/share-blog/${post.slug}`;

    // Si está en un móvil, usar el menú nativo de compartir (WhatsApp, Instagram, etc)
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          //text: `Echa un vistazo a este artículo de ${post.author?.full_name}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("El usuario canceló el share o hubo un error:", err);
      }
    } else {
      // Si está en PC, copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl);
        notify.success("¡Enlace copiado al portapapeles!");
      } catch (err) {
        notify.error("No se pudo copiar el enlace");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-zinc-500">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p>Cargando artículo...</p>
      </div>
    );
  }

  // Supabase .single() tira un error si no encuentra nada, lo cual activa isError
  if (isError || !post) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold dark:text-white">
          Blog no encontrado
        </h2>
        <p className="text-zinc-500">
          Es posible que este artículo haya sido eliminado o el enlace sea
          incorrecto.
        </p>
        <button
          onClick={() => navigate("/blog")}
          className="mt-4 px-6 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 transition-colors"
        >
          Volver a los blogs
        </button>
      </div>
    );
  }

  return (
    <article className="bg-white dark:bg-zinc-950 pb-20 relative">
      {/* Botón Flotante Atrás */}
      <button
        onClick={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate("/blog");
        }}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-xl 
             bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md 
             border border-zinc-200 dark:border-zinc-800
             text-zinc-700 dark:text-zinc-200 
             hover:scale-105 hover:shadow-lg transition-all"
      >
        <ArrowLeft size={18} />
      </button>

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

        <div className="flex gap-6 pt-3 border-t border-gray-50 dark:border-gray-900 mt-3 px-4">
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl transition-colors font-medium text-sm"
          >
            <Share2 size={18} />
            Compartir
          </button>
        </div>

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
              <Link
                to={`/profile/@${post.author?.username}`}
                className="text-xs px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition relative z-10"
              >
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
