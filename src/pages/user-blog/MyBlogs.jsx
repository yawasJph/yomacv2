import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Edit3, Eye, Trash2, Plus, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

const MyBlogs = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile()

  useEffect(() => {
    if (user) fetchMyBlogs();
  }, [user]);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("blogs")
        .select("id, title, slug, status, created_at, reading_time")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este artículo?")) return;
    const { error } = await supabaseClient.from("blogs").delete().eq("id", id);
    if (!error) setBlogs(blogs.filter(b => b.id !== id));
  };

  if (loading) return <div className="p-10 text-center">Cargando tu escritorio...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Mis Artículos</h1>
          <p className="text-zinc-500 text-sm">Gestiona tus borradores y publicaciones</p>
        </div>
        <button 
          onClick={() => navigate("/blog/create")}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          {isMobile ? <Plus size={18} />: (<><Plus size={18} /> Nuevo Blog</>)}
        </button>
      </header>

      {blogs.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <FileText className="mx-auto mb-4 text-zinc-400" size={48} />
          <p className="text-zinc-500">Aún no has escrito nada. ¡Empieza hoy!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 transition-all">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{blog.title}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    blog.status === 'published' 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {blog.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Creado el {new Date(blog.created_at).toLocaleDateString()} • {blog.reading_time} min lectura
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link 
                  to={`/blog/${blog.slug}`}
                  className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                  title="Ver publicación"
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
                  onClick={() => deleteBlog(blog.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBlogs;