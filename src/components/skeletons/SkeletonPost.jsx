// src/components/ui/SkeletonPost.jsx
const SkeletonPost = () => {
    return (
      <div className="w-full border-b border-gray-200 dark:border-gray-800 py-4 px-4 animate-pulse">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
  
          <div className="flex-1">
            {/* Nombre */}
            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded-md mb-2" />
  
            {/* Texto 1 */}
            <div className="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded-md mb-2" />
  
            {/* Texto 2 */}
            <div className="h-3 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-md mb-3" />
  
            {/* Imagen opcional */}
            <div className="w-full h-52 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    );
  };
  
  export default SkeletonPost;
  