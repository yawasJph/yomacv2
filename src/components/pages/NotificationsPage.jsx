import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  Reply,
  BellOff,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
//import { useNotifications } from "../../hooks/useNotifications";
import NotificationSkeleton from "../skeletons/NotificationSkeleton";
import ConfirmModal from "../modals/ConfirmModalv2";
import { useNotifications } from "@/hooks/notification/useNotificationsv2";

const NotificationsPage = () => {
  const { notifications, isLoading, clearAll, isDeleting, markAsRead } =
    useNotifications();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (notifications.some((n) => !n.is_read)) {
      // Solo si hay alguna no leída
      const timer = setTimeout(() => {
        markAsRead();
      }, 2000);
      return () => clearTimeout(timer); // Limpieza crucial
    }
  }, [notifications, markAsRead]);

  const handleConfirmDelete = () => {
    clearAll(null, {
      onSuccess: () => setIsDeleteModalOpen(false), // El modal se cierra SOLO si salió bien
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="fill-red-500 stroke-red-500" size={20} />;
      case "comment":
        return <MessageCircle className="text-blue-500" size={20} />;
      case "repost":
        return <Repeat2 className="text-green-500" size={20} />;
      case "follow":
        return <UserPlus className="text-purple-500" size={20} />;
      case "reply":
        return <Reply className="text-sky-500" size={20} />;
      default:
        return <BellOff size={20} />;
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
        if (!notif.comments?.parent_id) {
          navigate(`/post/${notif.post_id}`);
        } else {
          navigate(
            `/comment/${notif.comments.parent_id}#comment-${notif.comment_id}`,
          );
        }
        break;
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
            `/comment/${notif.comments.parent_id}#comment-${notif.comment_id}`,
          );
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto border-x border-gray-100 dark:border-gray-800">
        {/**min-h-screen */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800 animate-pulse" />
          <div className="w-32 h-6 bg-gray-200 dark:bg-neutral-800 animate-pulse rounded" />
        </div>
        <NotificationSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto border-x border-gray-100 dark:border-gray-800 ">
      {/**min-h-screen */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 flex items-center gap-6 border-b border-gray-100 dark:border-gray-800 justify-between">
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full"
          >
            <ArrowLeft size={20} className="dark:text-white" />
          </button>
          <h1 className="text-xl font-bold dark:text-white">Notificaiones</h1>
          {notifications.length > 0 && (
            <span className="px-2.5 py-0.5 bg-indigo-600 dark:bg-indigo-400 text-white text-xs font-bold rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              //if (confirm("¿Borrar todas las notificaciones?")) clearAll();
              setIsDeleteModalOpen(true);
            }}
            className="text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-indigo-900/30 dark:to-indigo-800/20 flex items-center justify-center">
              <BellOff
                className="text-gray-400 dark:text-indigo-500"
                size={32}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-indigo-100 mb-2">
              Sin notificaciones
            </h3>
            <p className="text-gray-500 dark:text-gray-300/70 mb-6 max-w-md mx-auto">
              ¡Interactúa con la comunidad para empezar a recibir
              notificaciones!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-linear-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-emerald-indigo/25 transition-all duration-300"
            >
              Explorar contenido
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${
                  !notif.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className="mt-1">{getIcon(notif.type)}</div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={notif.sender?.avatar}
                      alt={notif.sender?.full_name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>

                  <p className="text-[15px] text-gray-800 dark:text-gray-200">
                    {getMessage(notif)}
                  </p>

                  {/* Muestra el contenido según lo que causó la notificación */}
                  {(notif.post?.content || notif.comments?.content) && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 italic border-l-2 border-gray-200 pl-2">
                      "
                      {notif.comment_id
                        ? notif.comments?.content
                        : notif.post?.content}
                      "
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="¿Borrar todas las notificaciones?"
        message="Esta acción eliminará permanentemente todas tus notificaciones. No se puede deshacer."
      />
    </div>
  );
};

export default NotificationsPage;
