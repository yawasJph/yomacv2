import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, NotebookTabs, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

import BlogCard from "./BlogCardv3";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useBlogsInfinite } from "@/hooks/blog/useBlogsInfinite"; // Ajusta la ruta a tu hook

const BlogFeed = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Hook para detectar cuándo el usuario scrollea hasta el final
  const { ref, inView } = useInView({
    threshold: 0.5, // Se activa cuando el 50% del elemento invisible entra en pantalla
  });

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBlogsInfinite();

  // Aplanar el arreglo de páginas que devuelve React Query
  // React query devuelve: { pages: [ {data: [...]}, {data: [...]} ] }
  const posts = data?.pages.flatMap((page) => page.data) || [];

  // Disparar la carga de la siguiente página cuando 'ref' sea visible
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-10">
        Ocurrió un error al cargar los blogs. Intenta recargar la página.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="flex justify-between mx-3 items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="dark:text-white" />
            </button>
            <h1 className="text-4xl font-extrabold text-black dark:text-white mb-4">
              Blogs
            </h1>
          </div>

          {!isMobile && (
            <button
              onClick={() => navigate("/blog/my-blogs")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              <NotebookTabs size={20} /> Mis Blogs
            </button>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-3">
          Explora las últimas historias, tutoriales y noticias de nuestra comunidad.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
          <p className="text-gray-500 text-lg">No hay blogs publicados todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Observador invisible al final de la lista */}
      <div ref={ref} className="w-full flex justify-center py-10 mt-4">
        {isFetchingNextPage ? (
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        ) : hasNextPage ? (
          <span className="text-gray-400 text-sm">Desplázate para cargar más...</span>
        ) : posts.length > 0 ? (
          <span className="text-gray-400 text-sm font-medium">No hay más blogs</span>
        ) : null}
      </div>
    </div>
  );
};

export default BlogFeed;