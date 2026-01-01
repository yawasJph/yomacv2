import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Repeat2, UserPlus, Reply, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsPage = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();
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
      case 'like': return <Heart className="fill-red-500 stroke-red-500" size={20} />;
      case 'comment': return <MessageCircle className="text-blue-500" size={20} />;
      case 'repost': return <Repeat2 className="text-green-500" size={20} />;
      case 'follow': return <UserPlus className="text-purple-500" size={20} />;
      case 'reply': return <Reply className="text-sky-500" size={20} />;
      default: return <BellOff size={20} />;
    }
  };

  const getMessage = (notif) => {
    const name = <span className="font-bold">{notif.sender?.full_name}</span>;
    switch (notif.type) {
      case 'like': return <>{name} le dio me gusta a tu publicación</>;
      case 'comment': return <>{name} comentó tu post</>;
      case 'repost': return <>{name} reposteó tu publicación</>;
      case 'follow': return <>{name} comenzó a seguirte</>;
      case 'reply': return <>{name} respondió a tu comentario</>;
      default: return <>{name} interactuó contigo</>;
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center animate-pulse text-gray-500">Cargando notificaciones...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-gray-100 dark:border-gray-800">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md p-4 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-bold">Notificaciones</h1>
      </header>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-lg font-semibold">No tienes notificaciones aún</p>
            <p className="text-sm">¡Interactúa con la comunidad para empezar!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => notif.post_id && navigate(`/post/${notif.post_id}`)}
              className={`flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
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
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
                
                <p className="text-[15px] text-gray-800 dark:text-gray-200">
                  {getMessage(notif)}
                </p>

                {notif.post?.content && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2 italic border-l-2 border-gray-200 pl-2">
                    "{notif.post.content}"
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;