import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/supabase/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Edit3, Eye, Trash2, Plus, FileText, ChevronLeft, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { notify } from "@/utils/toast/notifyv3"; // Asumo que tienes esto según tu archivo anterior

const MyBlogs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // 1. QUERY: Obtener los blogs del usuario
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["my_blogs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("blogs")
        .select("id, title, slug, status, created_at, reading_time")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id, // Solo se ejecuta si el usuario está autenticado
  });

  // 2. MUTATION: Eliminar un blog
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabaseClient.from("blogs").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      notify.success("Artículo eliminado correctamente");
      // Invalidar para refrescar "Mis blogs" y el feed general
      queryClient.invalidateQueries({ queryKey: ["my_blogs", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["blogs_feed"] });
    },
    onError: (error) => {
      console.error("Error al eliminar:", error);
      notify.error("No se pudo eliminar el artículo");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-zinc-500">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p>Cargando tu escritorio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex gap-3">
            {isMobile && (
              <button
                onClick={() => navigate(-1)}
                className="p-1 -ml-2 text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-3xl font-bold dark:text-white">
              Mis Artículos
            </h1>
          </div>
          <p className="text-zinc-500 text-sm">
            Gestiona tus borradores y publicaciones
          </p>
        </div>
        <button
          onClick={() => navigate("/blog/create")}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          {isMobile ? (
            <Plus size={18} />
          ) : (
            <>
              <Plus size={18} /> Nuevo Blog
            </>
          )}
        </button>
      </header>

      {blogs.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <FileText className="mx-auto mb-4 text-zinc-400" size={48} />
          <p className="text-zinc-500">
            Aún no has escrito nada. ¡Empieza hoy!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => {
            const isDeletingThis = deleteMutation.isPending && deleteMutation.variables === blog.id;

            return (
              <div
                key={blog.id}
                className={`group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-emerald-500/50 transition-all gap-4 ${
                  isDeletingThis ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {/* LEFT */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* TITLE */}
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 wrap-break-word">
                      {blog.title}
                    </h3>

                    {/* STATUS */}
                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        blog.status === "published"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {blog.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </div>

                  {/* META */}
                  <p className="text-xs text-zinc-500 truncate">
                    Creado el {new Date(blog.created_at).toLocaleDateString()} •{" "}
                    {blog.reading_time} min lectura
                  </p>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                    title="Ver artículo"
                  >
                    <Eye size={18} />
                  </Link>

                  <button
                    onClick={() => navigate(`/blog/edit/${blog.id}`)}
                    className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Editar"
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(blog.id)}
                    disabled={isDeletingThis}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                    title="Eliminar"
                  >
                    {isDeletingThis ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBlogs;