import { createContext, useContext, useState, useCallback } from "react";

const LimitsRefreshContext = createContext();

/**
 * Kontekst do zarządzania odświeżaniem limitów zgłoszeń
 * Pozwala na kontrolowanie kiedy limity są sprawdzane ponownie
 */
export const LimitsRefreshProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Wymusza odświeżenie wszystkich limitów
   * Używane przy pull-to-refresh i po zgłoszeniu aktywności
   */
  const triggerLimitsRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);

    // Czekaj krótko, żeby dać czas na odświeżenie
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  /**
   * Sprawdza czy obecnie odświeżamy limity
   */
  const shouldRefreshLimits = useCallback(
    (lastRefreshTrigger) => {
      return refreshTrigger > lastRefreshTrigger;
    },
    [refreshTrigger],
  );

  const value = {
    refreshTrigger,
    isRefreshing,
    triggerLimitsRefresh,
    shouldRefreshLimits,
  };

  return (
    <LimitsRefreshContext.Provider value={value}>
      {children}
    </LimitsRefreshContext.Provider>
  );
};

/**
 * Hook do korzystania z kontekstu odświeżania limitów
 */
export const useLimitsRefresh = () => {
  const context = useContext(LimitsRefreshContext);
  if (!context) {
    throw new Error(
      "useLimitsRefresh must be used within LimitsRefreshProvider",
    );
  }
  return context;
};
