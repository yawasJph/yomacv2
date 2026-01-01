import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { useAuthAction } from "../../hooks/useAuthAction";

const NotificationIcon = () => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate()
  const {executeAction} = useAuthAction()

  const handleNotifications = () =>{
    executeAction(()=>{
        navigate("/notifications")
    }, "ver notificaiopnes")
  }

  return (
    <>
    <div className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer dark:text-indigo-400"
    onClick={handleNotifications}>
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-neutral-900">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
    <button className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all "
    onClick={handleNotifications}>
      <Bell size={20} className="text-indigo-500 dark:text-indigo-400 "  />
       {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-neutral-900">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
    </>
  );
};

export default NotificationIcon