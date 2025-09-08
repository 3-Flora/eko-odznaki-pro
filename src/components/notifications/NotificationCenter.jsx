import { useState } from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Bell,
  MailOpen,
  Clock,
  Info,
  AlertTriangle,
  BellIcon,
  MailOpenIcon,
  InfoIcon,
  Clock3,
} from "lucide-react";
import Button from "../ui/Button";
import clsx from "clsx";
import PageHeader from "../ui/PageHeader";
import PullToRefreshWrapper from "../ui/PullToRefreshWrapper";

/**
 * Komponent centrum powiadomień
 */
const NotificationCenter = ({ onClose }) => {
  const {
    notifications: allNotifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationsByType,
    getUnreadNotifications,
  } = useNotifications();

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showMarkAllConfirm, setShowMarkAllConfirm] = useState(false);

  /**
   * Pobiera powiadomienia do wyświetlenia na podstawie wybranego filtra
   */
  const getDisplayedNotifications = () => {
    switch (selectedFilter) {
      case "unread":
        return getUnreadNotifications();
      case "info":
        return getNotificationsByType("info");
      case "alert":
        return getNotificationsByType("alert");
      case "reminder":
        return getNotificationsByType("reminder");
      default:
        return allNotifications;
    }
  };

  /**
   * Obsługuje kliknięcie w powiadomienie
   */
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
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

  const displayedNotifications = getDisplayedNotifications();

  const filters = [
    { id: "all", label: <BellIcon />, count: unreadCount },
    { id: "unread", label: <MailOpenIcon />, count: unreadCount },
    {
      id: "info",
      label: <InfoIcon />,
      count: getNotificationsByType("info").filter((n) => !n.isRead).length,
    },
    {
      id: "alert",
      label: <AlertTriangle />,
      count: getNotificationsByType("alert").filter((n) => !n.isRead).length,
    },
    {
      id: "reminder",
      label: <Clock3 />,
      count: getNotificationsByType("reminder").filter((n) => !n.isRead).length,
    },
  ];

  return (
    <PullToRefreshWrapper
      onRefresh={fetchNotifications}
      threshold={80}
      enabled={true}
    >
      <div>
        <PageHeader
          title="Powiadomienia"
          subtitle="Zarządzaj swoimi powiadomieniami"
          emoji="🔔"
        />
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                variant="outline"
                size="sm"
                onClick={() => setShowMarkAllConfirm(true)}
                className="flex cursor-pointer items-center gap-1 rounded-full bg-gray-200 px-2 py-1.5 text-gray-900 dark:bg-gray-800 dark:text-gray-300"
              >
                <MailOpen className="h-4 w-4" />
                Wszystkie
              </button>
            )}
          </div>
        </div>

        {/* Filtry */}
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex min-w-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 font-medium transition-colors ${
                selectedFilter === filter.id
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <span className="truncate">{filter.label}</span>
              {filter.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-sm ${
                    selectedFilter === filter.id
                      ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                      : filter.id === "unread" && filter.count > 0
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                  }`}
                >
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Ładowanie powiadomień...
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4">
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Lista powiadomień */}
        {!loading && !error && (
          <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
            {displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center p-8 text-center">
                <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Brak powiadomień
                </h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  {selectedFilter === "unread"
                    ? "Nie masz nieprzeczytanych powiadomień"
                    : "Brak powiadomień w tej kategorii"}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`cursor-pointer rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                      !notification.isRead
                        ? "border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 ${getNotificationColor(notification.type)}`}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </h4>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            {formatNotificationDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      {/* Modal potwierdzenia */}
      {showMarkAllConfirm && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Oznacz wszystkie jako przeczytane
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Czy na pewno chcesz oznaczyć wszystkie powiadomienia jako
              przeczytane?
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowMarkAllConfirm(false)}
                className="flex-1"
              >
                Anuluj
              </Button>
              <Button
                onClick={async () => {
                  await markAllAsRead();
                  setShowMarkAllConfirm(false);
                }}
                className="flex-1"
              >
                Oznacz
              </Button>
            </div>
          </div>
        </div>
      )}
    </PullToRefreshWrapper>
  );
};

export default NotificationCenter;
