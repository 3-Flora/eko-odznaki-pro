import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook do obsługi pull-to-refresh na touch urządzeniach
 * @param {function} onRefresh - funkcja wywoływana przy odświeżeniu
 * @param {object} options - opcje konfiguracyjne
 * @param {number} options.threshold - próg w pikselach do wywołania odświeżenia (domyślnie 80)
 * @param {boolean} options.enabled - czy pull-to-refresh jest włączony (domyślnie true)
 * @returns {object} - stan i funkcje hook
 */
export function usePullToRefresh(onRefresh, options = {}) {
  const { threshold = 80, enabled = true } = options;

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(null);
  const containerRef = useRef(null);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;

    try {
      setIsRefreshing(true);
      await onRefresh();
    } catch (error) {
      console.error("Pull to refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  useEffect(() => {
    if (!enabled) return;

    // Znajdź kontener do przewijania
    let container = containerRef.current;
    if (!container) {
      container = document.querySelector("main");
      if (!container) return;
      containerRef.current = container;
    }

    const onTouchStart = (e) => {
      if (container.scrollTop > 0 || isRefreshing) return;
      startYRef.current = e.touches[0].clientY;
      setPullDistance(0);
      setIsPulling(true);
    };

    const onTouchMove = (e) => {
      if (!isPulling || startYRef.current == null || isRefreshing) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        // Dodaj opór - im więcej ciągniesz, tym trudniej
        const resistance = Math.min(delta * 0.6, threshold * 1.5);
        setPullDistance(resistance);
      } else {
        setPullDistance(0);
      }
    };

    const onTouchEnd = async () => {
      if (!isPulling) return;
      setIsPulling(false);
      const pulled = pullDistance;
      setPullDistance(0);
      startYRef.current = null;

      if (pulled >= threshold) {
        await handleRefresh();
      }
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [
    isPulling,
    pullDistance,
    threshold,
    enabled,
    handleRefresh,
    isRefreshing,
  ]);

  // Oblicz procent postępu (0-100)
  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    progress,
    threshold,
    containerRef,
  };
}
