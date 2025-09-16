import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";
import { formatResetDate } from "../../services/submissionLimitService";

/**
 * Komponent wyświetlający informacje o limitach zgłoszeń
 * @param {Object} limitData - Dane o limitach z useSubmissionLimits
 * @param {Object} stats - Statystyki zgłoszeń
 * @param {string} type - Typ aktywności ("eco_action" lub "challenge")
 * @param {boolean} compact - Czy wyświetlać w trybie kompaktowym
 */
export default function SubmissionLimitsInfo({
  limitData,
  stats,
  type,
  compact = false,
}) {
  if (!limitData) return null;

  // Dla EkoWyzwań, sprawdź najpierw ogólny limit tygodniowy
  if (
    type === "challenge" &&
    limitData.challengeLimit &&
    !limitData.challengeLimit.canSubmit
  ) {
    return (
      <div
        className={clsx(
          "rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20",
          compact ? "text-sm" : "",
        )}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle
            className={clsx(
              "text-orange-600 dark:text-orange-400",
              compact ? "h-4 w-4" : "h-5 w-5",
            )}
          />
          <div className="flex-1">
            <div
              className={clsx(
                "font-medium text-orange-800 dark:text-orange-300",
                compact ? "text-sm" : "",
              )}
            >
              Limit EkoWyzwań osiągnięty
            </div>
            <div
              className={clsx(
                "text-orange-700 dark:text-orange-400",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {limitData.challengeLimit.reason}
            </div>
            {limitData.challengeLimit.resetDate && (
              <div
                className={clsx(
                  "mt-1 flex items-center gap-1 text-orange-600 dark:text-orange-500",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>
                  Reset: {formatResetDate(limitData.challengeLimit.resetDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sprawdź limity konkretnej aktywności
  if (!limitData.canSubmit) {
    return (
      <div
        className={clsx(
          "rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20",
          compact ? "text-sm" : "",
        )}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle
            className={clsx(
              "text-red-600 dark:text-red-400",
              compact ? "h-4 w-4" : "h-5 w-5",
            )}
          />
          <div className="flex-1">
            <div
              className={clsx(
                "font-medium text-red-800 dark:text-red-300",
                compact ? "text-sm" : "",
              )}
            >
              Limit osiągnięty
            </div>
            <div
              className={clsx(
                "text-red-700 dark:text-red-400",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {limitData.reason}
            </div>
            {limitData.resetDate && (
              <div
                className={clsx(
                  "mt-1 flex items-center gap-1 text-red-600 dark:text-red-500",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>Reset: {formatResetDate(limitData.resetDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Wyświetl informacje o pozostałych zgłoszeniach
  if (compact) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-400">
            Pozostało: {limitData.remainingDaily || 0} dzisiaj,{" "}
            {limitData.remainingWeekly || 0} w tygodniu
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="font-medium text-green-800 dark:text-green-300">
            Możesz zgłosić tę aktywność
          </div>
          <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-400">
            {limitData.maxDaily && limitData.maxDaily !== 999 && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>
                  Dzisiaj: {limitData.currentDailyCount || 0}/
                  {limitData.maxDaily}
                </span>
              </div>
            )}
            {limitData.maxWeekly && limitData.maxWeekly !== 999 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>
                  W tym tygodniu: {limitData.currentWeeklyCount || 0}/
                  {limitData.maxWeekly}
                </span>
              </div>
            )}
            {(!limitData.maxDaily || limitData.maxDaily === 999) &&
              (!limitData.maxWeekly || limitData.maxWeekly === 999) && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>Bez limitów - możesz zgłaszać bez ograniczeń</span>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Kompaktowy komponent wyświetlający status limitów
 * @param {Object} limitData - Dane o limitach
 * @param {string} type - Typ aktywności
 */
export function SubmissionLimitsBadge({ limitData, type }) {
  if (!limitData) return null;

  // Sprawdź czy nie można zgłosić z powodu limitów EkoWyzwań
  if (
    type === "challenge" &&
    limitData.challengeLimit &&
    !limitData.challengeLimit.canSubmit
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
        <AlertTriangle className="h-3 w-3" />
        Limit osiągnięty (1/1)
      </span>
    );
  }

  // Sprawdź limity aktywności
  if (!limitData.canSubmit) {
    const isDaily = limitData.limitType === "daily";
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
        <AlertTriangle className="h-3 w-3" />
        {isDaily
          ? `Limit osiągnięty (${limitData.currentCount}/${limitData.maxAllowed})`
          : `Limit osiągnięty (${limitData.currentCount}/${limitData.maxAllowed})`}
      </span>
    );
  }

  // Pokaż pozostałe zgłoszenia - bardziej szczegółowo
  const hasLimits =
    (limitData.maxDaily && limitData.maxDaily !== 999) ||
    (limitData.maxWeekly && limitData.maxWeekly !== 999);

  if (hasLimits) {
    // Określ najważniejszy limit do pokazania
    let displayText = "";
    let iconColor = "text-green-600 dark:text-green-400";

    // Jeśli są oba limity, pokaż ten bardziej restrykcyjny
    if (
      limitData.maxDaily &&
      limitData.maxDaily !== 999 &&
      limitData.maxWeekly &&
      limitData.maxWeekly !== 999
    ) {
      if (limitData.remainingDaily <= limitData.remainingWeekly) {
        displayText = `Dzisiaj (${limitData.currentDailyCount || 0}/${limitData.maxDaily})`;
      } else {
        displayText = `W tygodniu (${limitData.currentWeeklyCount || 0}/${limitData.maxWeekly})`;
      }
    }
    // Tylko limit dzienny
    else if (limitData.maxDaily && limitData.maxDaily !== 999) {
      displayText = `Dzisiaj (${limitData.currentDailyCount || 0}/${limitData.maxDaily})`;
    }
    // Tylko limit tygodniowy
    else if (limitData.maxWeekly && limitData.maxWeekly !== 999) {
      displayText = `W tygodniu (${limitData.currentWeeklyCount || 0}/${limitData.maxWeekly})`;
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
        {displayText}
      </span>
    );
  }

  // Brak limitów
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
      Bez limitów
    </span>
  );
}

// Nie używane obecnie, ale może się przydać w przyszłości
/**
 * Komponent wyświetlający szczegółowy przegląd limitów dla wszystkich aktywności
 * @param {Array} ecoActions - Lista EkoDziałań
 * @param {Array} challenges - Lista EkoWyzwań
 * @param {Function} useSubmissionLimitsHook - Hook do sprawdzania limitów
 * @param {Object} currentUser - Aktualny użytkownik
 */
export function ActivityLimitsOverview({
  ecoActions = [],
  challenges = [],
  useSubmissionLimitsHook,
  currentUser,
}) {
  if (!currentUser) return null;

  const hasAnyLimits = ecoActions.some(
    (action) =>
      (action.maxDaily && action.maxDaily !== 999) ||
      (action.maxWeekly && action.maxWeekly !== 999),
  );

  if (!hasAnyLimits && challenges.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Twoje limity zgłoszeń
        </h3>
      </div>

      <div className="space-y-3">
        {/* EkoWyzwania - limit tygodniowy */}
        {challenges.length > 0 && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
            <div className="mb-2 flex items-center gap-2">
              <div className="text-purple-600 dark:text-purple-400">🏆</div>
              <span className="font-medium text-purple-800 dark:text-purple-300">
                EkoWyzwania
              </span>
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-400">
              1 wyzwanie na tydzień • Aktywnych: {challenges.length}
            </div>
          </div>
        )}

        {/* EkoDziałania z limitami */}
        {ecoActions
          .filter(
            (action) =>
              (action.maxDaily && action.maxDaily !== 999) ||
              (action.maxWeekly && action.maxWeekly !== 999),
          )
          .map((action) => (
            <ActionLimitSummary
              key={action.id}
              action={action}
              useSubmissionLimitsHook={useSubmissionLimitsHook}
            />
          ))}
      </div>
    </div>
  );
}

/**
 * Komponent podsumowania limitów dla pojedynczego EkoDziałania
 */
function ActionLimitSummary({ action, useSubmissionLimitsHook }) {
  const { limitData } = useSubmissionLimitsHook(action, "eco_action", true);

  if (!limitData) return null;

  const getDailyStatus = () => {
    if (!limitData.maxDaily || limitData.maxDaily === 999) return null;

    const current = limitData.currentDailyCount || 0;
    const max = limitData.maxDaily;
    const remaining = limitData.remainingDaily || 0;

    return { current, max, remaining, type: "daily" };
  };

  const getWeeklyStatus = () => {
    if (!limitData.maxWeekly || limitData.maxWeekly === 999) return null;

    const current = limitData.currentWeeklyCount || 0;
    const max = limitData.maxWeekly;
    const remaining = limitData.remainingWeekly || 0;

    return { current, max, remaining, type: "weekly" };
  };

  const dailyStatus = getDailyStatus();
  const weeklyStatus = getWeeklyStatus();

  if (!dailyStatus && !weeklyStatus) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-lg">{action.style?.icon || "🌱"}</div>
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {action.name}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        {dailyStatus && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Dzisiaj:</span>
            <div className="flex items-center gap-1">
              <span
                className={clsx(
                  "font-medium",
                  dailyStatus.remaining > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {dailyStatus.current}/{dailyStatus.max}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                (pozostało: {dailyStatus.remaining})
              </span>
            </div>
          </div>
        )}

        {weeklyStatus && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              W tygodniu:
            </span>
            <div className="flex items-center gap-1">
              <span
                className={clsx(
                  "font-medium",
                  weeklyStatus.remaining > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {weeklyStatus.current}/{weeklyStatus.max}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                (pozostało: {weeklyStatus.remaining})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
