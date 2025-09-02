import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useNotifications } from "../../contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Bell,
  BellRing,
  ChevronRight,
  Clock,
  Info,
  AlertTriangle,
} from "lucide-react";

/**
 * Komponent dzwonka powiadomień z podglądem
 */
const NotificationBell = ({ size = "default", showPreview = true }) => {
  const navigate = useNavigate();
  const { unreadCount, getRecentNotifications, markAsRead } =
    useNotifications();

  const [showPopover, setShowPopover] = useState(false);

  /**
   * Obsługuje kliknięcie w dzwonek
   */
  const handleBellClick = () => {
    if (showPreview && unreadCount > 0) {
      setShowPopover(!showPopover);
    } else {
      navigate("/notifications");
    }
  };

  /**
   * Obsługuje kliknięcie w powiadomienie w podglądzie
   */
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setShowPopover(false);
    navigate("/notifications");
  };

  /**
   * Pobiera ikonę dla typu powiadomienia
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return AlertTriangle;
      case "reminder":
        return Clock;
      case "info":
      default:
        return Info;
    }
  };

  /**
   * Pobiera kolor dla typu powiadomienia
   */
  const getNotificationColor = (type) => {
    switch (type) {
      case "alert":
        return "text-red-500";
      case "reminder":
        return "text-orange-500";
      case "info":
      default:
        return "text-blue-500";
    }
  };

  /**
   * Formatuje datę powiadomienia
   */
  const formatNotificationDate = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true, locale: pl });
  };

  const recentNotifications = getRecentNotifications(3);

  return (
    <div className="relative">
      <button
        variant="ghost"
        size="sm"
        onClick={handleBellClick}
        className="relative p-2"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-blue-600" />
        ) : (
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover z podglądem powiadomień */}
      {showPreview && showPopover && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPopover(false)}
          />

          {/* Popover content */}
          <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Najnowsze powiadomienia
                </h3>
                <button
                  onClick={() => {
                    setShowPopover(false);
                    navigate("/notifications");
                  }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Wszystkie
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-64 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="p-4 text-center">
                  <Bell className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Brak nowych powiadomień
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(
                      notification.type,
                    );
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`cursor-pointer p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !notification.isRead
                            ? "border-l-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                            : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`mt-1 ${getNotificationColor(notification.type)}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                              {!notification.isRead && (
                                <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                              )}
                            </h4>
                            <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                              {notification.message.length > 60
                                ? `${notification.message.substring(0, 60)}...`
                                : notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {formatNotificationDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
