import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ post }) => {
  return (
    <div className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
      {/* Banner */}
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img 
          src={post.banner_url || '/placeholder.jpg'} 
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
            {post.reading_time} min lectura
          </span>
          <span className="text-xs text-gray-500">
            {/* {new Date(post.created_at).toLocaleDateString()} */}
            {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2 text-black dark:text-white line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        <Link 
          to={`/blog/${post.slug}`} 
          className="inline-flex items-center text-blue-600 font-semibold text-sm hover:underline"
        >
          Leer más →
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;