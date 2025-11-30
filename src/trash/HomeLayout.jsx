import React from "react";

const HomeLayout = () => {
  const [urlMeta, setUrlMeta] = useState(null);
  const [linkUrl, setLinkUrl] = useState(null);
  const scrollContainerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
    // Mínima distancia para considerar un swipe
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };
  
    const onTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };
  
    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
  
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
  
      if (isLeftSwipe && currentIndex < images.length - 1) {
        goToNext();
      }
      if (isRightSwipe && currentIndex > 0) {
        goToPrevious();
      }
    };
    const goToSlide = (index) => {
      setCurrentIndex(index);
    };

    useEffect(() => {
      const url = extractFirstUrl(post.content);
      if (!url) return;
  
      setLinkUrl(url);
      const fetchMetadata = async () => {
        try {
          const { data, error } = await supabaseClient.functions.invoke(
            "hyper-task",
            { body: { url } }
          );
          if (!error) setUrlMeta(data);
        } catch (e) {
          console.error(e);
        }
      };
  
      fetchMetadata();
    }, [post.content]);
  return (
    <div className="min-h-screen bg-white dark:bg-black transition duration-300">
      <Header />

      {/* 🔹 Layout Principal */}
      <div className="pt-16 flex max-w-7xl mx-auto">
        {/* Sidebar Izquierda */}

        <LeftSidebar />

        {/* Contenido Principal */}
        <main className="flex-1 min-h-screen px-4 py-6 lg:px-6 max-w-2xl mx-auto bg-white dark:bg-black">
          <Outlet />
        </main>

        {/* Sidebar Derecha */}
        <RigthSidebar />
      </div>

      {/* 🔹 Barra inferior móvil mejorada */}

      {/* 🔹 Botón de descarga visible solo en móvil */}

      {/* Botón para mostrar/ocultar preview */}
      {(content || previews.length > 0) && (
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-sm font-medium"
        >
          {showPreview ? <Eye size={20} /> : <EyeClosed size={20} />}
        </button>
      )}

      {/* Preview del Post */}
      {showPreview && (content || previews.length > 0) && (
        <div className="mt-6 border-2 border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-4 bg-gray-50 dark:bg-gray-900/50 ">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-emerald-500/10">
            Vista previa del post
          </h3>

          <div className="bg-white dark:bg-black rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            {/* Header del preview */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user.user_metadata.avatar_url || "/default-avatar.jpg"}
                alt={user.user_metadata.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {user.user_metadata.full_name || "Usuario"}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>Ahora mismo</span>
                  <span>•</span>
                  <Globe size={12} />
                </div>
              </div>
            </div>

            {/* Contenido del preview */}
            <div className="space-y-3">
              {content && (
                <p className="text-gray-900 dark:text-gray-100 text-sm whitespace-pre-wrap">
                  {content}
                </p>
              )}

              {previews.length > 0 && renderImageGrid(previews, true)}
            </div>

            {/* Estadísticas del preview */}
            <div className="flex justify-around items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <span className="grid text-center">
                0 <span>me gusta</span>
              </span>
              <span>•</span>
              <span className="grid text-center">
                0 <span>comentarios</span>
              </span>
              <span>•</span>
              <span className="grid text-center">
                0 <span>compartidos</span>
              </span>
            </div>

            {/* Acciones del preview */}
            <div className="flex items-center justify-around mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
              <button className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                👍 Me gusta
              </button>
              <button className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                💬 Comentar
              </button>
              <button className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                🔄 Compartir
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            Así se verá tu publicación cuando sea compartida
          </p>
        </div>
      )}
    </div>
  );
};

export default HomeLayout;
