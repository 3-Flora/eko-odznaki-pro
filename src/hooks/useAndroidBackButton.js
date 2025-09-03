import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Capacitor } from "@capacitor/core";

/**
 * Hook do obsługi przycisku "wstecz" na Androidzie
 * Automatycznie nawiguje do poprzedniej strony w historii
 *
 * Uwaga: Wymaga zainstalowania @capacitor/app dla pełnej funkcjonalności
 * Instalacja: npm install @capacitor/app
 */
export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Sprawdź czy aplikacja działa na Androidzie
    if (
      !Capacitor.isNativePlatform() ||
      Capacitor.getPlatform() !== "android"
    ) {
      return;
    }

    // Dynamiczny import - pozwala na bezpieczne użycie nawet bez zainstalowanego pluginu
    const setupBackButtonHandler = async () => {
      try {
        const { App: CapacitorApp } = await import("@capacitor/app");

        const handleBackButton = () => {
          // Lista ścieżek, gdzie przycisk "wstecz" powinien zamknąć aplikację
          const exitRoutes = ["/"];

          if (exitRoutes.includes(location.pathname)) {
            // Na stronie głównej - zamknij aplikację
            CapacitorApp.exitApp();
          } else {
            // Na innych stronach - wróć do poprzedniej
            navigate(-1);
          }
        };

        // Dodaj listener na zdarzenie przycisku "wstecz"
        const listener = await CapacitorApp.addListener(
          "backButton",
          handleBackButton,
        );

        // Zwróć funkcję cleanup
        return () => {
          listener.remove();
        };
      } catch (error) {
        console.warn(
          'Plugin @capacitor/app nie jest zainstalowany. Obsługa przycisku "wstecz" na Androidzie może być ograniczona.',
        );

        // Fallback: obsługa zdarzenia popstate w webview
        const handlePopState = (event) => {
          // Zapobiegnij domyślnemu zachowaniu przeglądarki
          event.preventDefault();

          const exitRoutes = ["/"];
          if (exitRoutes.includes(location.pathname)) {
            // Na stronie głównej - spróbuj zamknąć aplikację poprzez window.close()
            window.close();
          } else {
            // Na innych stronach - wróć do poprzedniej
            navigate(-1);
          }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
          window.removeEventListener("popstate", handlePopState);
        };
      }
    };

    let cleanup = () => {};
    setupBackButtonHandler().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    // Cleanup przy odmontowywaniu
    return () => {
      cleanup();
    };
  }, [navigate, location.pathname]);
};
