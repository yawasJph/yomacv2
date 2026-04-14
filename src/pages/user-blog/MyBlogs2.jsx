import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useMyBlogs } from "@/hooks/blog/useMyBlogs";
import { MyBlogHeader } from "./MyBlogHeader";
import { MyBlogEmpty } from "./MyBlogEmpty";
import { MyBlogCard } from "./MyBlogCard";
import { Link } from "react-router-dom";

const MyBlogs = () => {
  const { user } = useAuth();
  const { blogs, isLoading, isError, deleteMutation } = useMyBlogs({ user });

  const handleDelete = (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer.",
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  if (isError) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 p-5 ">
        <p className="text-red-500">
          Ocurrió un error al cargar tus blogs. Intenta recargar la página.
        </p>
        <p className="text-gray-600">o</p>
        <Link
          to={"/blog"}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Volver a Blog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <MyBlogHeader />

      {blogs.length === 0 ? (
        <MyBlogEmpty />
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => {
            const isDeletingThis =
              deleteMutation.isPending && deleteMutation.variables === blog.id;

            return (
              <MyBlogCard
                key={blog.id}
                blog={blog}
                isDeletingThis={isDeletingThis}
                onDelete={() => handleDelete(blog.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBlogs;
