import { useState } from 'react';
import { Bell, BellOff, ShieldCheck, Settings } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { toast } from 'sonner';

const PushSettings = () => {
  const { subscribeToPush } = usePushNotifications();
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
  const [isPending, setIsPending] = useState(false);

  // Verificar si el navegador soporta Push
  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  const handleActivate = async () => {
    setIsPending(true);
    try {
      await subscribeToPush();
      setPermissionStatus(Notification.permission);
      if (Notification.permission === 'granted') {
        toast.success("¡Notificaciones activadas correctamente!");
      }
    } catch (error) {
      toast.error("Hubo un error al activar las notificaciones");
    } finally {
      setIsPending(false);
    }
  };

  if (!isSupported) return null; // No mostrar nada si el navegador es muy antiguo

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={18} className="text-indigo-500" />
            <h2 className="text-lg font-bold dark:text-white">Alertas de escritorio</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Recibe avisos de likes, comentarios y nuevos seguidores directamente en tu dispositivo, incluso si no tienes la app abierta.
          </p>
        </div>

        <div className="shrink-0">
          {permissionStatus === 'granted' ? (
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full">
              <ShieldCheck size={20} />
              <span className="text-sm font-bold">Activado</span>
            </div>
          ) : (
            <button
              onClick={handleActivate}
              disabled={isPending || permissionStatus === 'denied'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
                permissionStatus === 'denied'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Bell size={18} />
                  {permissionStatus === 'denied' ? 'Bloqueado' : 'Activar'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {permissionStatus === 'denied' && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl flex items-center gap-3">
          <BellOff size={16} className="text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-500">
            Has bloqueado las notificaciones. Debes resetear los permisos en la configuración de tu navegador para activarlas.
          </p>
        </div>
      )}
    </div>
  );
};

export default PushSettings;