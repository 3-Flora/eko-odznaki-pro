import { useNavigate } from "react-router";
import { useNotifications } from "../../contexts/NotificationContext";
import { Bell, BellRing } from "lucide-react";

export default function SimpleNotificationBell() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const handleClick = () => {
    navigate("/notifications");
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors dark:bg-gray-800"
      >
        {unreadCount > 0 ? (
          <BellRing className="text-orange-500 dark:text-orange-400" />
        ) : (
          <Bell className="text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Badge z liczbą nieprzeczytanych powiadomień */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}
