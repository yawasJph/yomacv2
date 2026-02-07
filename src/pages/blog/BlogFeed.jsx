import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/supabase/supabaseClient";
import BlogCard from "./BlogCard";
import { useNavigate } from "react-router-dom";


const BlogFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false }); // Los más nuevos primero

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
       <div className="flex justify-between mx-3">
         <h1 className="text-4xl font-extrabold text-black dark:text-white mb-4">
          Nuestro Blog
        </h1>
        <button onClick={()=>navigate("/blog/create")}>Crear Blog</button>
       </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
          Explora las últimas historias, tutoriales y noticias de nuestra comunidad.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-gray-500 text-lg">No hay posts publicados todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogFeed;