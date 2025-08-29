import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useNavigate } from "react-router";
import { getEcoActions } from "../services/ecoActionService";
import { getActiveChallenges } from "../services/challengeService";
import PageHeader from "../components/ui/PageHeader";
import { backgroundEcoAction as backgroundStyles } from "../utils/styleUtils";
import clsx from "clsx";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

export default function ActivityPage() {
  const navigate = useNavigate();
  const [ecoActions, setEcoActions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loadingActions, setLoadingActions] = useState(true);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  const { showError } = useToast();
  const { currentUser } = useAuth();

  // Ładowanie EkoDziałań z bazy danych
  useEffect(() => {
    const loadEcoActions = async () => {
      try {
        setLoadingActions(true);
        const actions = await getEcoActions();
        setEcoActions(actions);
      } catch (error) {
        console.error("Error loading eco actions:", error);
        showError("Nie udało się załadować EkoDziałań");
      } finally {
        setLoadingActions(false);
      }
    };

    loadEcoActions();
  }, [showError]);

  // Ładowanie EkoWyzwań z bazy danych
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoadingChallenges(true);
        if (currentUser?.classId) {
          const activeChallenges = await getActiveChallenges(
            currentUser.classId,
          );
          setChallenges(activeChallenges);
        } else {
          console.warn("User has no classId, cannot load challenges");
          setChallenges([]);
        }
      } catch (error) {
        console.error("Error loading challenges:", error);
        showError("Nie udało się załadować EkoWyzwań");
      } finally {
        setLoadingChallenges(false);
      }
    };

    loadChallenges();
  }, [currentUser.classId, showError]);

  const handleActionSelect = (action) => {
    navigate("/submit/action", { state: { action } });
  };

  const handleChallengeSelect = (challenge) => {
    navigate("/submit/challenge", { state: { challenge } });
  };

  return (
    <div className="min-h-svh bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Wybierz EkoDziałanie lub Wyzwanie"
        emoji="🌍"
        subtitle="Dotknij działania lub wyzwania, które chcesz zgłosić"
      />

      <div>
        {/* Loading state */}
        {loadingActions && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Ładowanie EkoDziałań...
            </span>
          </div>
        )}

        {/* No actions available */}
        {!loadingActions && ecoActions.length === 0 && (
          <div className="mt-8 rounded-2xl bg-yellow-50 p-8 text-center dark:bg-yellow-900/20">
            <div className="mb-4 text-4xl">📝</div>
            <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Brak dostępnych EkoDziałań
            </h3>
            <p className="text-yellow-600 dark:text-yellow-400">
              W bazie danych nie ma jeszcze żadnych EkoDziałań do zgłoszenia.
            </p>
          </div>
        )}

        {/* Actions Grid */}
        {!loadingActions && ecoActions.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {ecoActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionSelect(action)}
                className="flex aspect-square flex-col items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex flex-col items-center">
                  <div
                    className={clsx(
                      "mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl",
                      backgroundStyles[action.style?.color || "default"],
                    )}
                  >
                    {action.style?.icon || "🌱"}
                  </div>
                  <div
                    className={clsx(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      backgroundStyles[action.style?.color || "default"],
                    )}
                  >
                    {action.category}
                  </div>
                </div>
                <h3 className="leading-tight font-semibold text-gray-800 dark:text-white">
                  {action.name}
                </h3>
              </button>
            ))}
          </div>
        )}

        {/* Challenges Section */}
        {challenges.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
              Dostępne EkoWyzwania
            </h2>

            {/* Loading state for challenges */}
            {loadingChallenges && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Ładowanie EkoWyzwań...
                </span>
              </div>
            )}

            {/* Challenges Grid */}
            {!loadingChallenges && challenges.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {challenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    onClick={() => handleChallengeSelect(challenge)}
                    className="flex items-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-2xl">
                      🏆
                    </div>
                    <div className="flex-1 text-left">
                      <div className="mb-1 flex items-center">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          {challenge.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {challenge.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {challenge.description}
                      </p>
                    </div>
                    <div className="ml-4 text-gray-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
