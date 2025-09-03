import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

/**
 * Hook do obsługi gestu przesunięcia palcem (swipe) w lewo jako cofnięcie strony
 * Działa na urządzeniach dotykowych (mobile/tablet)
 */
export const useSwipeBackGesture = (options = {}) => {
  const navigate = useNavigate();
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const {
    minDistance = 100, // Minimalna odległość przesunięcia w pikselach
    maxVerticalDistance = 150, // Maksymalna odległość w pionie (żeby nie konfliktować ze scrollem)
    edgeThreshold = 50, // Odległość od lewej krawędzi, w jakiej można rozpocząć gest
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];

      // Sprawdź czy dotyk rozpoczął się blisko lewej krawędzi
      if (touch.clientX <= edgeThreshold) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
      }
    };

    const handleTouchMove = (e) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = () => {
      if (!touchStartRef.current || !touchEndRef.current) {
        touchStartRef.current = null;
        touchEndRef.current = null;
        return;
      }

      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = Math.abs(touchEndRef.current.y - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Sprawdź czy to był prawidłowy gest "swipe right"
      const isSwipeRight = deltaX > minDistance;
      const isHorizontal = deltaY < maxVerticalDistance;
      const isFastEnough = deltaTime < 500; // Maksymalnie 500ms na gest

      if (isSwipeRight && isHorizontal && isFastEnough) {
        navigate(-1);
      }

      // Reset
      touchStartRef.current = null;
      touchEndRef.current = null;
    };

    // Dodaj event listenery do całego dokumentu
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate, minDistance, maxVerticalDistance, edgeThreshold, enabled]);
};
