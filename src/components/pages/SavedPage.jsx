import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import CardPost from "../ui/feed/CardPost";
import SkeletonPost from "../skeletons/SkeletonPost";
import { usePostsInfiniteQuery } from "../../hooks/usePostsInfiniteQuery2";

const SavedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const loaderRef = useRef();

  // Usamos nuestro hook optimizado
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePostsInfiniteQuery({ type: "bookmarks", userId: user?.id });

  // Scroll Infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage]);

  const allSavedPosts = data?.pages.flat() || [];

  return (
    <div className="bg-white dark:bg-black">{/* min-h-screen */}
      {/* HEADER */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 flex items-center gap-6 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold dark:text-white">Guardados</h1>
          <p className="text-xs text-gray-500">@{user?.email.split("@")[0]}</p>
        </div>
      </div>

      {/* LISTA DE POSTS */}
      {/* LISTA DE POSTS */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {isLoading ? (
          <div>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonPost key={i} />
            ))}
          </div>
        ) : allSavedPosts.length > 0 ? (
          <>
            {allSavedPosts.map((post) => (
              <CardPost key={post.id} post={post} media={post.post_media} />
            ))}
            
            {/* Elemento para detectar el final de la lista */}
            <div ref={loaderRef} className="py-10 flex justify-center">
              {isFetchingNextPage && (
                <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
              )}
            </div>
          </>
        ) : (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full">
              <Bookmark size={40} className="text-gray-400" />
            </div>
            <div className="max-w-xs">
              <h2 className="text-xl font-bold dark:text-white">Aún no has guardado nada</h2>
              <p className="text-gray-500 text-sm mt-2">
                Los posts que guardes aparecerán aquí de forma privada.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
