import { useState, useEffect, useCallback, memo } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import {
  getCachedEcoActions,
  getCachedEcoChallenges,
  invalidateCachedEcoActions,
  invalidateCachedEcoChallenges,
} from "../services/contentCache";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import PageHeader from "../components/ui/PageHeader";
import PullToRefreshIndicator from "../components/ui/PullToRefreshIndicator";
import { backgroundEcoAction as backgroundStyles } from "../utils/styleUtils";
import clsx from "clsx";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useLimitsRefresh } from "../contexts/LimitsRefreshContext";
import {
  useSubmissionLimits,
  useWeeklyChallengeLimit,
} from "../hooks/useSubmissionLimits";
import {
  SubmissionLimitsBadge,
  ActivityLimitsOverview,
} from "../components/ui/SubmissionLimitsInfo";

export default function ActivityPage() {
  const navigate = useNavigate();
  const [ecoActions, setEcoActions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challengeSubmissions, setChallengeSubmissions] = useState({}); // Mapa: challengeId -> status zgłoszenia
  const [loading, setLoading] = useState(true);

  const { showError } = useToast();
  const { currentUser, getChallengeSubmissionStatus } = useAuth();
  const { triggerLimitsRefresh } = useLimitsRefresh();

  // Hook do sprawdzania limitów EkoWyzwań
  // Pobieramy też funkcję `refresh`, aby odświeżyć tylko ogólny limit tygodniowy
  // zamiast triggerować globalne odświeżenie dla wszystkich hooków.
  const { limitData: weeklyLimitData, refresh: refreshWeeklyLimit } =
    useWeeklyChallengeLimit(!!currentUser);

  // Funkcja do ładowania danych
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const actions = await getCachedEcoActions();
      const challenges = await getCachedEcoChallenges();

      setChallenges(challenges);
      setEcoActions(actions);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Nie udało się załadować EkoDziałań/EkoWyzwań");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Funkcja odświeżania dla pull-to-refresh
  const handleRefresh = useCallback(async () => {
    invalidateCachedEcoActions();
    invalidateCachedEcoChallenges();
    await loadData();
    // Odśwież tylko tygodniowy limit (unikamy masowych fetchów dla każdej karty)
    if (typeof refreshWeeklyLimit === "function") {
      await refreshWeeklyLimit();
    } else {
      // fallback: jeśli z jakiegoś powodu nie ma tej funkcji, zachowaj dotychczasowe zachowanie
      await triggerLimitsRefresh();
    }
  }, [loadData, triggerLimitsRefresh, refreshWeeklyLimit]);

  // Pull-to-refresh hook
  const pullToRefresh = usePullToRefresh(handleRefresh, {
    threshold: 80,
    enabled: true,
  });

  // Ładowanie wszystkich EkoDziałań możliwych do wykonania
  useEffect(() => {
    loadData();
  }, [loadData, currentUser, getChallengeSubmissionStatus]);

  const handleActionSelect = useCallback(
    (action) => {
      navigate("/submit/action", { state: { action } });
    },
    [navigate],
  );

  const handleChallengeSelect = (challenge) => {
    const submission = challengeSubmissions[challenge.id];

    if (submission) {
      if (submission.status === "approved") {
        showError(
          "To wyzwanie zostało już przez Ciebie wykonane i zatwierdzone!",
        );
        return;
      } else if (submission.status === "pending") {
        showError("Twoje zgłoszenie tego wyzwania jest w trakcie weryfikacji.");
        return;
      }
    }

    navigate("/submit/action", { state: { challenge } });
  };

  // ...existing code...

  // Funkcja pomocnicza do określania statusu wyzwania
  const getChallengeStatus = (challengeId) => {
    const submission = challengeSubmissions[challengeId];

    if (!submission) {
      return {
        canSubmit: true,
        statusText: null,
        statusColor: null,
      };
    }

    switch (submission.status) {
      case "approved":
        return {
          canSubmit: false,
          statusText: "✅ Zatwierdzone",
          statusColor:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case "pending":
        return {
          canSubmit: false,
          statusText: "⏳ W weryfikacji",
          statusColor:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
      case "rejected":
        return {
          canSubmit: true,
          statusText: "❌ Odrzucone",
          statusColor:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
      default:
        return {
          canSubmit: true,
          statusText: null,
          statusColor: null,
        };
    }
  };

  return (
    <>
      {/* Pull-to-refresh indicator - fixed na górze ekranu */}
      <PullToRefreshIndicator
        isPulling={pullToRefresh.isPulling}
        isRefreshing={pullToRefresh.isRefreshing}
        progress={pullToRefresh.progress}
        threshold={pullToRefresh.threshold}
        onRefresh={handleRefresh}
      />

      <div className="min-h-svh bg-gray-50 dark:bg-gray-900">
        <PageHeader
          title="Wybierz EkoDziałanie lub Wyzwanie"
          emoji="🌍"
          subtitle="Dotknij działania lub wyzwania, które chcesz zgłosić"
        />

        {/* Przegląd limitów zgłoszeń */}
        {/* {currentUser && (
          <ActivityLimitsOverview
            ecoActions={ecoActions}
            challenges={challenges}
            useSubmissionLimitsHook={useSubmissionLimits}
            currentUser={currentUser}
          />
        )} */}

        <div>
          {/* Challenges Section - wyświetlane na górze gdy są dostępne */}
          <div className="mb-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                🏆 Dostępne EkoWyzwania
              </h2>
            </div>
            {weeklyLimitData && !weeklyLimitData.canSubmit && (
              <SubmissionLimitsBadge
                limitData={{ challengeLimit: weeklyLimitData }}
                type="challenge"
              />
            )}

            {/* Loading state for challenges */}
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Ładowanie EkoWyzwań...
                </span>
              </div>
            )}

            {/* Challenges Grid */}
            {!loading && challenges.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {challenges.length <= 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    Brak dostępnych EkoWyzwań
                  </p>
                ) : (
                  challenges.map((challenge) => {
                    const challengeStatus = getChallengeStatus(challenge.id);

                    return (
                      <button
                        key={challenge.id}
                        onClick={() => handleChallengeSelect(challenge)}
                        disabled={!challengeStatus.canSubmit}
                        className={clsx(
                          "flex items-center rounded-2xl border p-4 shadow-sm transition-all duration-200",
                          challengeStatus.canSubmit
                            ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] dark:border-green-700 dark:from-green-900/30 dark:to-emerald-900/30"
                            : "cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50",
                        )}
                      >
                        <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-2xl shadow-lg">
                          🏆
                        </div>
                        <div className="flex-1 text-left">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            {challengeStatus.statusText && (
                              <span
                                className={clsx(
                                  "rounded-full px-2 py-1 text-xs font-medium",
                                  challengeStatus.statusColor,
                                )}
                              >
                                {challengeStatus.statusText}
                              </span>
                            )}
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                              {challenge.category}
                            </span>
                          </div>
                          <h3
                            className={clsx(
                              "font-semibold",
                              challengeStatus.canSubmit
                                ? "text-gray-800 dark:text-white"
                                : "text-gray-500 dark:text-gray-400",
                            )}
                          >
                            {challenge.name}
                          </h3>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* EkoDziałania Section */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
              🌱 EkoDziałania
            </h2>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Ładowanie EkoDziałań...
                </span>
              </div>
            )}

            {/* No actions available */}
            {!loading && ecoActions.length === 0 && (
              <div className="mt-8 rounded-2xl bg-yellow-50 p-8 text-center dark:bg-yellow-900/20">
                <div className="mb-4 text-4xl">📝</div>
                <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Brak dostępnych EkoDziałań
                </h3>
                <p className="text-yellow-600 dark:text-yellow-400">
                  W bazie danych nie ma jeszcze żadnych EkoDziałań do
                  zgłoszenia.
                </p>
              </div>
            )}

            {/* Actions Grid */}
            {!loading && ecoActions.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {ecoActions.map((action) => (
                  <EcoActionCard
                    key={action.id}
                    action={action}
                    onSelect={handleActionSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Memoized card component moved outside ActivityPage to avoid re-creation on each render
const EcoActionCard = memo(function EcoActionCard({ action, onSelect }) {
  // Let the hook read currentUser from AuthContext itself; enabling by default
  const { limitData, canSubmit } = useSubmissionLimits(
    action,
    "eco_action",
    true,
  );

  return (
    <div className="w-full">
      <button
        onClick={() => (canSubmit ? onSelect(action) : null)}
        disabled={!canSubmit}
        className={clsx(
          "group relative flex w-full flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all duration-200",
          canSubmit
            ? "border-gray-200 bg-white shadow-sm hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800"
            : "cursor-not-allowed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50",
        )}
      >
        <div
          className={clsx(
            "flex h-16 w-16 items-center justify-center rounded-2xl text-3xl",
            canSubmit
              ? backgroundStyles[action.style?.color || "default"]
              : "bg-gray-100 dark:bg-gray-600",
          )}
        >
          {action.style?.icon || "🌱"}
        </div>
        <div className="w-full">
          <h3
            className={clsx(
              "text-sm font-semibold",
              canSubmit
                ? "text-gray-800 dark:text-white"
                : "text-gray-500 dark:text-gray-400",
            )}
          >
            {action.name}
          </h3>
          <div className="mt-2 flex justify-center">
            <SubmissionLimitsBadge limitData={limitData} type="eco_action" />
          </div>
        </div>
      </button>
    </div>
  );
});
