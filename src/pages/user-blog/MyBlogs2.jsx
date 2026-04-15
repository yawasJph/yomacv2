import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft } from "lucide-react";
import { useMyBlogs } from "@/hooks/blog/useMyBlogs";
import { MyBlogHeader } from "./MyBlogHeader";
import { MyBlogEmpty } from "./MyBlogEmpty";
import { MyBlogCard } from "./MyBlogCard";
import { Link } from "react-router-dom";
import { MyBlogCardSkeleton } from "@/components/skeletons/MyBlogCardSkeleton";
import ConfirmModal from "@/components/modals/ConfirmModalv2";

const LENGTH_SKELETON = 3;

const MyBlogs = () => {
  const { user } = useAuth();
  const { blogs, isLoading, isError, deleteMutation } = useMyBlogs({ user });
  const [openModal, setOpenModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const handleDelete = React.useCallback(
    (blog) => {
      deleteMutation.mutate(blog.id, {
        onSuccess: () => setOpenModal(false),
      });
    },
    [deleteMutation],
  );

  const handleActionDelete = React.useCallback((blog) => {
    setSelectedBlog(blog);
    setOpenModal(true);
  }, []);

  if (isError) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 p-5 text-center space-y-5">
        <p className="text-red-500">
          Ocurrió un error al cargar tus blogs. Intenta recargar la página.
        </p>
        <Link
          to={"/blog"}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          <ChevronLeft size={18} />
          <span className="">Volver a Blogs</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <MyBlogHeader />

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: LENGTH_SKELETON }).map((_, i) => (
            <MyBlogCardSkeleton key={i} />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <MyBlogEmpty />
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => {
            // const isDeletingThis =
            //   deleteMutation.isPending && deleteMutation.variables === blog.id;

            return (
              <MyBlogCard
                key={blog.id}
                blog={blog}
                onActionDelete={handleActionDelete}
              />
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={openModal}
        message={
          "¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer."
        }
        title={"¿Eliminar artículo?"}
        onClose={() => setOpenModal(false)}
        isLoading={deleteMutation.isPending}
        onConfirm={() => handleDelete(selectedBlog)}
      />
    </div>
  );
};

export default MyBlogs;
