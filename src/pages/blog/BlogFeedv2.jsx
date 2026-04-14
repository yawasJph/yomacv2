import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import BlogCard from "./BlogCardv3";
import { useBlogsInfinite } from "@/hooks/blog/useBlogsInfinite";
import { BlogFeedButton } from "@/components/blog/BlogFeedButton";
import { BlogCardSkeleton } from "@/components/skeletons/BlogCardSkeleton";
import { getInitSkeletons } from "@/utils/blog/initSkeletonsRender";

const BlogFeed = () => {
  const navigate = useNavigate();
  const arraySkeleton = getInitSkeletons();

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

  if (isError) {
    return (
      <div className="text-center text-red-500 py-10">
        Ocurrió un error al cargar los blogs. Intenta recargar la página.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
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

          <BlogFeedButton />
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-3">
          Explora las últimas historias, tutoriales y noticias de nuestra
          comunidad.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-3">
          {arraySkeleton.map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
          <p className="text-gray-500 text-lg">
            No hay blogs publicados todavía.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Observador invisible al final de la lista */}
      {!isLoading && (
        <div ref={ref} className="w-full flex justify-center py-10 mt-4">
          {isFetchingNextPage ? (
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          ) : hasNextPage ? (
            <span className="text-gray-400 text-sm">
              Desplázate para cargar más...
            </span>
          ) : posts.length > 0 ? (
            <span className="text-gray-400 text-sm font-medium">
              No hay más blogs
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default BlogFeed;
