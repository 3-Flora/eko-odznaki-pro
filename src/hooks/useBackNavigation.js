import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Capacitor } from "@capacitor/core";

/**
 * Kompletny hook do obsługi nawigacji "wstecz" na urządzeniach mobilnych
 * Obsługuje przycisk "wstecz" na Androidzie oraz klawiaturę na desktop
 */
export const useBackNavigation = (options = {}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    exitRoutes = ["/"], // Ścieżki, gdzie "wstecz" zamyka aplikację
    enableKeyboard = true, // Obsługa klawiatury na desktop
    enableAndroidBack = true, // Obsługa przycisku "wstecz" na Androidzie
  } = options;

  useEffect(() => {
    const isOnExitRoute = exitRoutes.includes(location.pathname);

    // Obsługa klawiatury (głównie dla developmentu/testowania)
    const handleKeyPress = (event) => {
      if (!enableKeyboard) return;

      // Alt + Left Arrow lub Backspace (gdy nie jest w input)
      if (
        (event.altKey && event.key === "ArrowLeft") ||
        (event.key === "Backspace" &&
          !["INPUT", "TEXTAREA"].includes(event.target.tagName))
      ) {
        event.preventDefault();

        if (isOnExitRoute) {
          // Na desktop nie zamykamy okna, tylko logujemy
          console.log("Próba zamknięcia aplikacji (desktop)");
        } else {
          navigate(-1);
        }
      }
    };

    // Obsługa przycisku "wstecz" na Androidzie
    const setupAndroidBackButton = async () => {
      if (!enableAndroidBack) return () => {};
      if (
        !Capacitor.isNativePlatform() ||
        Capacitor.getPlatform() !== "android"
      ) {
        return () => {};
      }

      try {
        const { App: CapacitorApp } = await import("@capacitor/app");

        const handleBackButton = () => {
          if (isOnExitRoute) {
            CapacitorApp.exitApp();
          } else {
            navigate(-1);
          }
        };

        const listener = await CapacitorApp.addListener(
          "backButton",
          handleBackButton,
        );
        return () => listener.remove();
      } catch (error) {
        console.warn("Plugin @capacitor/app nie jest zainstalowany.");
        return () => {};
      }
    };

    // Dodaj event listenery
    if (enableKeyboard) {
      document.addEventListener("keydown", handleKeyPress);
    }

    let androidCleanup = () => {};
    if (enableAndroidBack) {
      setupAndroidBackButton().then((cleanup) => {
        androidCleanup = cleanup;
      });
    }

    // Cleanup
    return () => {
      if (enableKeyboard) {
        document.removeEventListener("keydown", handleKeyPress);
      }
      androidCleanup();
    };
  }, [
    navigate,
    location.pathname,
    exitRoutes,
    enableKeyboard,
    enableAndroidBack,
  ]);
};
