import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  Reply,
  BellOff,
  ArrowLeft,
  Sparkles,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useNotifications } from "../../hooks/useNotifications";

const NotificationsPage = () => {
  const { notifications, isLoading, markAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();

  // Al entrar a la página y después de 2 segundos, marcamos todo como leído
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        markAsRead();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="fill-rose-500 stroke-rose-500" size={22} />;
      case "comment":
        return <MessageCircle className="text-sky-500" size={22} />;
      case "repost":
        return <Repeat2 className="text-emerald-500" size={22} />;
      case "follow":
        return <UserPlus className="text-violet-500" size={22} />;
      case "reply":
        return <Reply className="text-amber-500" size={22} />;
      default:
        return <BellOff size={22} className="text-gray-400" />;
    }
  };

  const getMessage = (notif) => {
    const name = <span className="font-bold">{notif.sender?.full_name}</span>;

    // Si es un LIKE, hay que distinguir si fue al Post o al Comentario
    if (notif.type === "like") {
      return notif.comment_id ? (
        <>{name} le dio me gusta a tu comentario</>
      ) : (
        <>{name} le dio me gusta a tu publicación</>
      );
    }

    switch (notif.type) {
      case "comment":
        return <>{name} comentó tu post</>;
      case "repost":
        return <>{name} reposteó tu publicación</>;
      case "follow":
        return <>{name} comenzó a seguirte</>;
      case "reply":
        return <>{name} respondió a tu comentario</>;
      default:
        return <>{name} interactuó contigo</>;
    }
  };

  const handleNotificationClick = (notif) => {
    switch (notif.type) {
      case "follow":
        navigate(`/profile/${notif.sender_id}`);
        break;
      case "like":
      case "repost":
        if (notif.post_id) navigate(`/post/${notif.post_id}`);
        break;
      case "comment":
        // Si tienes scroll al comentario, puedes pasar el ID como hash
        if (notif.post_id)
          navigate(`/post/${notif.post_id}#comment-${notif.comment_id}`);
        break;
      case "reply":
        // Si tienes scroll al comentario, puedes pasar el ID como hash
        if (notif.post_id)
          navigate(
            `/comment/${notif.comments.parent_id}#comment-${notif.comment_id}`
          );
        break;
      default:
        break;
    }
  };

  console.log(notifications);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-emerald-900/5 p-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 bg-white dark:bg-gray-900 rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-100 dark:border-emerald-900/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-emerald-900/20 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ArrowLeft size={20} className="text-gray-700 dark:text-emerald-400" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-500 hidden sm:block" size={20} />
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
                  Notificaciones
                </h1>
                {notifications.length > 0 && (
                  <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>
            </div>
            
            {notifications.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("¿Borrar todas las notificaciones?")) clearAll();
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-emerald-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Limpiar todo</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center">
                <BellOff className="text-gray-400 dark:text-emerald-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-emerald-100 mb-2">
                Sin notificaciones
              </h3>
              <p className="text-gray-500 dark:text-emerald-300/70 mb-6 max-w-md mx-auto">
                ¡Interactúa con la comunidad para empezar a recibir notificaciones!
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
              >
                Explorar contenido
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-emerald-900/20 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:scale-[1.02] active:scale-[0.99]
                    ${!notif.is_read ? 
                      "ring-2 ring-emerald-500/20 dark:ring-emerald-500/30 bg-gradient-to-r from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/10" 
                      : ""}`}
                >
                  {/* Unread indicator */}
                  {!notif.is_read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Icon with gradient background */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-emerald-900/30 dark:to-emerald-800/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {getIcon(notif.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* User info and time */}
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={notif.sender?.avatar}
                          alt={notif.sender?.full_name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-emerald-900 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-emerald-100 truncate">
                            {notif.sender?.full_name}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-emerald-400/70">
                            {formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Notification message */}
                      <p className="text-sm text-gray-700 dark:text-emerald-200 mb-3">
                        {getMessage(notif)}
                      </p>

                      {/* Content preview */}
                      {(notif.post?.content || notif.comments?.content) && (
                        <div className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:to-emerald-500">
                          <p className="text-sm text-gray-600 dark:text-emerald-300/80 italic line-clamp-2">
                            "
                            {notif.comment_id
                              ? notif.comments?.content
                              : notif.post?.content}
                            "
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover effect border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-500/10 dark:group-hover:border-emerald-500/20 transition-all duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;