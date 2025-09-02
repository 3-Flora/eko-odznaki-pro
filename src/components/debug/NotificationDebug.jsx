import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  createNotification,
  createGlobalNotification,
  createClassNotification,
  createUserNotification,
} from "../../services/notificationService";
import { Bell, Send, Trash2, RefreshCw } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";

/**
 * Komponent do debugowania i testowania powiadomień
 */
const NotificationDebug = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const { fetchNotifications, clearCache } = useNotifications();

  const [loading, setLoading] = useState(false);

  /**
   * Tworzy testowe powiadomienie informacyjne
   */
  const createTestInfoNotification = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await createNotification({
        title: "🔍 Testowe powiadomienie informacyjne",
        message:
          "To jest testowe powiadomienie typu 'info'. Zostało utworzone przez system debug.",
        createdBy: currentUser.id,
        type: "info",
        isGlobal: false,
        target: {
          userId: currentUser.id,
        },
      });

      showSuccess("Utworzono testowe powiadomienie informacyjne");
      fetchNotifications(true); // Wymusza odświeżenie
    } catch (error) {
      console.error(
        "❌ Błąd podczas tworzenia testowego powiadomienia:",
        error,
      );
      showError("Nie udało się utworzyć testowego powiadomienia");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tworzy testowe powiadomienie przypomnienia
   */
  const createTestReminderNotification = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await createNotification({
        title: "⏰ Testowe przypomnienie",
        message:
          "Nie zapomnij o zgłoszeniu swojego dzisiejszego EkoDziałania! To testowe przypomnienie z systemu debug.",
        createdBy: currentUser.id,
        type: "reminder",
        isGlobal: false,
        target: {
          userId: currentUser.id,
        },
      });

      showSuccess("Utworzono testowe przypomnienie");
      fetchNotifications(true);
    } catch (error) {
      console.error(
        "❌ Błąd podczas tworzenia testowego przypomnienia:",
        error,
      );
      showError("Nie udało się utworzyć testowego przypomnienia");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tworzy testowe powiadomienie alertu
   */
  const createTestAlertNotification = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await createNotification({
        title: "🚨 Testowy alert",
        message:
          "UWAGA: To jest testowe powiadomienie alertu o wysokim priorytecie. Zostało wygenerowane przez system debug.",
        createdBy: currentUser.id,
        type: "alert",
        isGlobal: false,
        target: {
          userId: currentUser.id,
        },
      });

      showSuccess("Utworzono testowy alert");
      fetchNotifications(true);
    } catch (error) {
      console.error("❌ Błąd podczas tworzenia testowego alertu:", error);
      showError("Nie udało się utworzyć testowego alertu");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tworzy globalne testowe powiadomienie
   */
  const createTestGlobalNotification = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await createGlobalNotification(
        "🌍 Globalne powiadomienie testowe",
        "To jest testowe powiadomienie globalne widoczne dla wszystkich użytkowników. Utworzone przez system debug.",
        currentUser.id,
        "info",
      );

      showSuccess("Utworzono globalne testowe powiadomienie");
      fetchNotifications(true);
    } catch (error) {
      console.error(
        "❌ Błąd podczas tworzenia globalnego powiadomienia:",
        error,
      );
      showError("Nie udało się utworzyć globalnego powiadomienia");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tworzy powiadomienie dla klasy (jeśli użytkownik ma klasę)
   */
  const createTestClassNotification = async () => {
    if (!currentUser || !currentUser.classId) {
      showError("Użytkownik nie należy do żadnej klasy");
      return;
    }

    setLoading(true);
    try {
      await createClassNotification(
        "🎓 Powiadomienie dla klasy",
        `To jest testowe powiadomienie skierowane do całej klasy ${currentUser.classId}. Utworzone przez system debug.`,
        currentUser.id,
        currentUser.classId,
        "info",
      );

      showSuccess("Utworzono powiadomienie dla klasy");
      fetchNotifications(true);
    } catch (error) {
      console.error(
        "❌ Błąd podczas tworzenia powiadomienia dla klasy:",
        error,
      );
      showError("Nie udało się utworzyć powiadomienia dla klasy");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Czyści cache powiadomień
   */
  const handleClearCache = () => {
    clearCache();
    showSuccess("Cache powiadomień został wyczyszczony");
  };

  /**
   * Wymusza odświeżenie powiadomień
   */
  const handleRefreshNotifications = () => {
    fetchNotifications(true);
    showSuccess("Powiadomienia zostały odświeżone");
  };

  if (!currentUser) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <p className="text-red-600 dark:text-red-400">
          Musisz być zalogowany, aby używać debug powiadomień
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Debug Powiadomień
        </h3>
      </div>

      <div className="space-y-4">
        {/* Informacje o użytkowniku */}
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Użytkownik:</strong> {currentUser.displayName} (
            {currentUser.role})
          </p>
          {currentUser.classId && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Klasa:</strong> {currentUser.classId}
            </p>
          )}
          {currentUser.schoolId && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Szkoła:</strong> {currentUser.schoolId}
            </p>
          )}
        </div>

        {/* Przyciski do tworzenia testowych powiadomień */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={createTestInfoNotification}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Utwórz Info
          </button>

          <button
            onClick={createTestReminderNotification}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Utwórz Przypomnienie
          </button>

          <button
            onClick={createTestAlertNotification}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Utwórz Alert
          </button>

          <button
            onClick={createTestGlobalNotification}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Utwórz Globalne
          </button>

          {currentUser.classId && (
            <button
              onClick={createTestClassNotification}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Utwórz dla Klasy
            </button>
          )}
        </div>

        {/* Narzędzia zarządzania */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-600">
          <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
            Narzędzia zarządzania
          </h4>
          <div className="flex gap-3">
            <button
              onClick={handleRefreshNotifications}
              className="flex items-center gap-2 rounded-lg bg-gray-500 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
              Odśwież
            </button>

            <button
              onClick={handleClearCache}
              className="flex items-center gap-2 rounded-lg bg-gray-500 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-600"
            >
              <Trash2 className="h-4 w-4" />
              Wyczyść Cache
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Tworzenie powiadomienia...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDebug;
