import { useCallback } from "react";
import { useRegisterRefresh } from "../contexts/RefreshContext";

// Hook pomocniczy do testowania systemu odświeżania
export function useRefreshTest(id, message = "Refreshing...") {
  const refreshFunction = useCallback(async () => {
    console.log(`🔄 ${message} (${id})`);
    // Symuluj opóźnienie
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`✅ Refresh completed for ${id}`);
  }, [id, message]); // Dodaj zależności

  useRegisterRefresh(id, refreshFunction);

  return refreshFunction;
}
