import { Link } from "react-router-dom";

const BlogCard = ({ post }) => {
  // Asumiendo que en tu query de Supabase haces un .select('*, profiles:author_id(*)')
  const author = post.profiles; 

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
      {/* Banner */}
      <div className="aspect-video overflow-hidden bg-gray-100 relative">
        <img 
          src={post.banner_url || '/placeholder.jpg'} 
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge de categoría o tiempo encima de la imagen (Opcional) */}
        <div className="absolute top-2 left-2">
           <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-black/60 text-white backdrop-blur-md rounded-md">
            {post.reading_time} min lectura
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col grow">
        <h3 className="text-lg font-bold mb-2 text-black dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 grow">
          {post.excerpt}
        </p>

        {/* Autor y Fecha - El toque humano */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <img 
            src={author?.avatar || '/default-avatar.png'} 
            alt={author?.full_name}
            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-zinc-700"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">
              {author?.full_name || 'Usuario Arévalo'} gonzales carrasco tapia
            </span>
            <span className="text-[10px] text-gray-500">
              {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <Link 
            to={`/blog/${post.slug}`} 
            className="ml-auto p-2  rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
          >
            {/* <span className="sr-only">Leer más</span> */}
            →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;