import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const RefreshContext = createContext();

export function RefreshProvider({ children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTriggers, setRefreshTriggers] = useState(new Map());

  // Rejestruje funkcję odświeżania dla danej strony/komponentu
  const registerRefreshTrigger = useCallback((id, triggerFn) => {
    setRefreshTriggers((prev) => {
      const newTriggers = new Map(prev);
      newTriggers.set(id, triggerFn);
      return newTriggers;
    });

    // Zwracamy funkcję czyszczącą
    return () => {
      setRefreshTriggers((prev) => {
        const newTriggers = new Map(prev);
        newTriggers.delete(id);
        return newTriggers;
      });
    };
  }, []);

  // Globalne odświeżanie - wywołuje wszystkie zarejestrowane funkcje
  const triggerGlobalRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Wywołaj wszystkie zarejestrowane funkcje odświeżania równolegle
      const promises = Array.from(refreshTriggers.values()).map((fn) => {
        try {
          return fn();
        } catch (error) {
          console.error("Error in refresh trigger:", error);
          return Promise.resolve();
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error during global refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTriggers, isRefreshing]);

  // 🆕 FUNKCJA SPECYFICZNEGO ODŚWIEŻANIA - używana po aktualizacji statusu zgłoszeń
  // Odświeżanie konkretnej strony/komponentu po ID (np. "teacher-submissions")
  const triggerSpecificRefresh = useCallback(
    async (id) => {
      const refreshFn = refreshTriggers.get(id);
      if (refreshFn) {
        try {
          console.log(`🔄 Triggering specific refresh for: ${id}`);
          await refreshFn();
        } catch (error) {
          console.error(`Error refreshing ${id}:`, error);
        }
      } else {
        console.warn(`No refresh function registered for ID: ${id}`);
      }
    },
    [refreshTriggers],
  );

  const value = React.useMemo(
    () => ({
      isRefreshing,
      registerRefreshTrigger,
      triggerGlobalRefresh,
      triggerSpecificRefresh,
    }),
    [
      isRefreshing,
      registerRefreshTrigger,
      triggerGlobalRefresh,
      triggerSpecificRefresh,
    ],
  );

  return (
    <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
  );
}

export function useGlobalRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error("useGlobalRefresh must be used within RefreshProvider");
  }
  return context;
}

// Hook dla komponentów które chcą zarejestrować swoją funkcję odświeżania
export function useRegisterRefresh(id, refreshFn) {
  const { registerRefreshTrigger } = useGlobalRefresh();
  const refreshFnRef = useRef(refreshFn);

  // Aktualizuj ref przy każdej zmianie funkcji
  refreshFnRef.current = refreshFn;

  React.useEffect(() => {
    console.log(`🔧 Registering refresh function for: ${id}`);

    if (!refreshFnRef.current) return;

    // Owijamy w funkcję która zawsze wywołuje aktualną wersję
    const stableRefreshFn = (...args) => refreshFnRef.current?.(...args);

    const cleanup = registerRefreshTrigger(id, stableRefreshFn);

    return () => {
      console.log(`🧹 Cleaning up refresh function for: ${id}`);
      cleanup();
    };
  }, [id, registerRefreshTrigger]); // Tylko stabilne zależności
}
