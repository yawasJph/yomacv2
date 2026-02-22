import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";
import BlogCard from "./BlogCard";
import { useNavigate } from "react-router-dom";
import { NotebookTabs } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

const BlogFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("blogs")
        .select(
          `
          *, 
          profiles:author_id(
            full_name,
            avatar  
          )`,
        ) // Trae también el username y avatar del autor
        .order("created_at", { ascending: false }) // Los más nuevos primero
        .eq("status", "published"); // Solo los publicados

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Error al cargar blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="flex justify-between mx-3 items-center">
          <h1 className="text-4xl font-extrabold text-black dark:text-white mb-4">
            Nuestro Blog
          </h1>

          <button onClick={() => navigate("/blog/my-blogs")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">
            {isMobile ? <NotebookTabs size={20}/> :(<><NotebookTabs size={20}/> Mis Blogs</>)}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
          Explora las últimas historias, tutoriales y noticias de nuestra
          comunidad.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-gray-500 text-lg">
            No hay posts publicados todavía.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-3 ">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogFeed;
