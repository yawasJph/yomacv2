// src/components/ui/SkeletonPost.jsx
const SkeletonPost = () => {
  return (
    <>
      <div className="divide-y divide-emerald-500/10 dark:divide-emerald-500/20">
        <div className="relative overflow-hidden bg-white dark:bg-black p-4 rounded-xl shadow mb-6 ">
          {/* ✨ Capa shimmer */}
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

          <div className="flex gap-3 items-start w-full">
            {/* 🧩 Avatar */}
            <div className="skeleton w-11 h-11 bg-gray-300 dark:bg-gray-700 rounded-full shrink-0" />

            <div className="flex-1 min-w-0 space-y-3">
              {/* Nombre + fecha */}
              <div className="skeleton h-4 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="skeleton h-3 w-28 bg-gray-200 dark:bg-gray-600 rounded"></div>

              {/* Contenido */}
              <div className="space-y-2 mt-3">
                <div className="skeleton h-3 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="skeleton h-3 w-5/6 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Imagen del post */}
              <div className="skeleton w-full h-52 bg-gray-300 dark:bg-gray-700 rounded-lg mt-3"></div>

              {/* Botones de acción */}
              <div className="flex justify-between items-center mt-3">
                <div className="skeleton h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="skeleton h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="skeleton h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkeletonPost;
