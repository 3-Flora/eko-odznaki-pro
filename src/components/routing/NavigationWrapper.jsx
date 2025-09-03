import { useBackNavigation } from "../../hooks/useBackNavigation";
import { useSwipeBackGesture } from "../../hooks/useSwipeBackGesture";

/**
 * Komponent wrapper który obsługuje nawigację "wstecz"
 * Musi być umieszczony wewnątrz BrowserRouter
 */
export default function NavigationWrapper({ children }) {
  // Kompletna obsługa nawigacji "wstecz"
  useBackNavigation({
    exitRoutes: ["/"], // Na stronie głównej zamknij aplikację
    enableKeyboard: true, // Obsługa klawiszy na desktop
    enableAndroidBack: true, // Obsługa przycisku "wstecz" na Androidzie
  });

  // Hook do obsługi gestu przesunięcia jako cofnięcie strony
  useSwipeBackGesture({
    enabled: true,
    minDistance: 80,
    edgeThreshold: 30,
  });

  return children;
}
