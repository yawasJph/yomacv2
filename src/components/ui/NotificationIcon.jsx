import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { useAuthAction } from "../../hooks/useAuthAction";

const NotificationIcon = () => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { executeAction } = useAuthAction();

  const handleNotifications = () => {
    executeAction(() => {
      navigate("/notifications");
    }, "ver notificaiopnes");
  };

  return (
    <>
      <div
        className="relative rounded-full transition-colors dark:text-indigo-400"
      >
        <button
          className="p-2 rounded-xl bg-white dark:bg-neutral-900 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-xs transition-all cursor-pointer "
          onClick={handleNotifications}
        >
          <Bell size={20} className={`text-indigo-500 dark:text-indigo-400 ${unreadCount && "animate-bounce"}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-1  bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-neutral-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default NotificationIcon;
