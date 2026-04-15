import { Edit3, Eye, Trash2 } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export const MyBlogCard = React.memo(({ blog, onActionDelete }) => {
  return (
    <div
      className={`group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-emerald-500/50 transition-all gap-4 ${
        false ? "opacity-50 pointer-events-none" : ""
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

        <Link
          to={`/blog/edit/${blog.id}`}
          className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
          title="Editar"
        >
          <Edit3 size={18} />
        </Link>

        <button
          onClick={() => onActionDelete(blog)}
          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
});
