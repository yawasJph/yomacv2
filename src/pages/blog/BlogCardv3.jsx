import React from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { optimizeMedia } from "@/cloudinary/optimizeMedia";

const BlogCard = ({ post }) => {
    console.log(post.profiles.full_name)
  return (
    <article className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/10">

      {/* Glow hover */}
      {/* <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-linear-to-tr from-emerald-500/10 via-transparent to-indigo-500/10 pointer-events-none" /> */}

      {/* Banner */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={post.banner_url || "/placeholder.jpg"}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />

        {/* Reading time badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur">
          <Clock size={12} />
          {post.reading_time} min
        </div>
      </div>

      {/* Info */}
      <div className="p-5">

        {/* Fecha */}
        <p className="text-xs text-zinc-500 mb-2">
          {new Date(post.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-500 transition">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">

          {/* Autor */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={optimizeMedia(post.profiles?.avatar, "image") || "/default-avatar.png"}
              className="w-7 h-7 rounded-full object-cover"
              alt={post.profiles?.full_name}
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
              {post.profiles?.full_name}
            </span>
          </div>

          {/* CTA */}
          <Link
            to={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition group/link"
          >
            Leer
            <ArrowRight
              size={14}
              className="transition-transform group-hover/link:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;