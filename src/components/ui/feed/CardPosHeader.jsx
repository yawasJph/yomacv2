import UserHoverCard from "./UserHoverCard3";
import CPHOptionsModal from "./CPHOptionsModal";

const CardPosHeader = ({
  post,
  time,
  isMe,
  setIsDeleteModalOpen,
  handleReportAction,
  isMobile,
}) => {

  const displayName = post.profiles.alias || post.profiles.full_name;

  return (
    <div className="flex items-start gap-3 mb-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {/* Info usuario */}
          <div className="flex-1 min-w-0">
            <div
              className="flex flex-wrap items-center gap-1.5 min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nombre */}
              {!isMobile && !isMe ? (
                <UserHoverCard user={post.profiles}>
                  <span
                    className="
                    text-sm sm:text-base
                    font-bold
                    text-gray-900 dark:text-gray-100
                    hover:underline
                    cursor-pointer
                     truncate
                     max-w-[140px] sm:max-w-[220px] md:max-w-none
                     "
                  >
                    {displayName}
                  </span>
                </UserHoverCard>
              ) : (
                <span
                  className="
                    text-sm sm:text-base
                    font-bold
                    text-gray-900 dark:text-gray-100
                    hover:underline
                    cursor-pointer
                    truncate
                    max-w-[140px] sm:max-w-[220px] md:max-w-none
                            "
                >
                  {displayName}
                </span>
              )}

              {/* Username */}
              {post.profiles.username && (
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  @{post.profiles.username}
                </span>
              )}

              {/* Punto */}
              <span className="text-xs text-gray-300 dark:text-gray-600">
                ·
              </span>

              {/* Tiempo */}
              <span
                className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap"
                title={new Date(post.created_at).toLocaleString("es-PE")}
              >
                {time}
              </span>
            </div>

            {/* Badges */}
            {(post.profiles.carrera || post.profiles.ciclo) && (
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {post.profiles.carrera && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    {post.profiles.carrera}
                  </span>
                )}

                {post.profiles.ciclo && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    Ciclo {post.profiles.ciclo}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Opciones */}
          {/* <div
            onClick={(e) => e.stopPropagation()}
            className="relative shrink-0"
            ref={optionsRef}
          >
            <button
              onClick={() => {
                setShowOptions(!showOptions);
              }}
              className="
                        w-8 h-8
                        flex items-center justify-center
                        rounded-full
                        text-gray-400
                        hover:bg-gray-100 dark:hover:bg-gray-800
                        transition-colors
                      "
            >
              <MoreHorizontal size={16} />
            </button>

            {showOptions && (
              <div
                className="
                          absolute right-0 mt-2 w-48
                          bg-white dark:bg-neutral-900
                          border border-gray-100 dark:border-gray-800
                          rounded-xl shadow-xl
                          z-50 overflow-hidden
                          animate-in fade-in zoom-in duration-100
                        "
                onClick={(e) => e.stopPropagation()}
              >
                {isMe ? (
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setShowOptions(false);
                    }}
                    className="
                                w-full flex items-center gap-3
                                px-4 py-3 text-sm
                                text-red-500
                                hover:bg-red-50 dark:hover:bg-red-500/10
                                transition-colors
                              "
                  >
                    <Trash2 size={16} />
                    <span className="font-medium">Eliminar post</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleReportAction();
                      setShowOptions(false);
                    }}
                    className="
                              w-full flex items-center gap-3
                              px-4 py-3 text-sm
                              text-gray-700 dark:text-gray-300
                              hover:bg-gray-50 dark:hover:bg-gray-800
                              transition-colors
                            "
                  >
                    <Flag size={16} />
                    <span className="font-medium">Reportar contenido</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/post/${post.id}`,
                    );

                    notify.success("Enlace copiado");
                    setShowOptions(false);
                  }}
                  className="
                      w-full flex items-center gap-3
                              px-4 py-3 text-sm
                              text-gray-700 dark:text-gray-300
                              hover:bg-gray-50 dark:hover:bg-gray-800
                              transition-colors
                              border-t border-gray-100 dark:border-gray-800
                            "
                >
                  <AlertCircle size={16} />
                  <span className="font-medium">Copiar enlace</span>
                </button>
              </div>
            )}
          </div> */}
          <CPHOptionsModal isMe={isMe} handleReportAction={handleReportAction} setIsDeleteModalOpen={setIsDeleteModalOpen} post={post}/>
        </div>
      </div>
    </div>
  );
};

export default CardPosHeader;
