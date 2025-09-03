import { useAuth } from "../contexts/AuthContext";
import { useEffect, useMemo } from "react";
import useDashboardData from "../hooks/useDashboardData";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import LargeChallengeCard from "../components/dashboard/LargeChallengeCard";
import ActionsCarousel from "../components/dashboard/ActionsCarousel";
import TeacherStatsCard from "../components/dashboard/TeacherStatsCard";
import PendingVerificationCard from "../components/dashboard/PendingVerificationCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import PullToRefreshIndicator from "../components/ui/PullToRefreshIndicator";
import { useToast } from "../contexts/ToastContext";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  // Używamy nowego hook-a do zarządzania danymi dashboardu z cache
  const {
    data,
    loading,
    errors,
    isAnyLoading,
    lastRefresh,
    refreshAll,
    isTeacher,
    isEkoskop,
  } = useDashboardData(currentUser);

  // Pull-to-refresh
  const { isPulling, isRefreshing, progress, containerRef } = usePullToRefresh(
    refreshAll,
    {
      threshold: 80,
      enabled: true,
    },
  );

  // Wyświetlanie błędów jako toast
  useEffect(() => {
    if (errors.ecoChallenge) {
      toast.show?.({
        title: "Błąd",
        description: "Nie udało się pobrać aktywnego wyzwania",
      });
    }
  }, [errors.ecoChallenge, toast]);

  useEffect(() => {
    if (errors.ecoActions) {
      toast.show?.({
        title: "Błąd",
        description: "Nie udało się pobrać szybkich akcji",
      });
    }
  }, [errors.ecoActions, toast]);

  useEffect(() => {
    if (errors.teacher) {
      toast.show?.({
        title: "Błąd",
        description: "Nie udało się pobrać danych nauczyciela",
      });
    }
  }, [errors.teacher, toast]);

  const headerText = isEkoskop
    ? "Witaj w panelu Ekoskop — tutaj zarządzasz całym systemem, szkołami, użytkownikami i treściami edukacyjnymi."
    : isTeacher
      ? "Witaj w panelu nauczyciela — tutaj zobaczysz statystyki klasy, zgłoszenia do weryfikacji i szybkie akcje."
      : "Witaj na stronie głównej — tutaj zobaczysz aktualne wyzwania, szybkie działania i swój postęp.";

  const challengeCardData = useMemo(() => {
    const ecoChallenge = data.ecoChallenge;
    if (!ecoChallenge) return undefined;

    const {
      id,
      challengeId,
      name,
      challengeName,
      description,
      challengeDescription,
      endDate,
      icon,
    } = ecoChallenge;

    return {
      ecoActivityId: id ?? challengeId,
      name: name ?? challengeName,
      description: description ?? challengeDescription,
      type: "challenge",
      endDate,
      icon: icon ?? "🎯",
    };
  }, [data.ecoChallenge]);

  return (
    <>
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        progress={progress}
        threshold={80}
        onRefresh={refreshAll}
      />

      <div ref={containerRef}>
        <DashboardHeader
          name={currentUser?.displayName}
          text={headerText}
          isRefreshing={isRefreshing}
          lastRefresh={lastRefresh}
          onRefresh={refreshAll}
          className="mb-6"
        />

        {/* Teacher-only section */}
        {isTeacher && (
          <div className="flex flex-col gap-6 lg:mb-0 lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              {loading.teacher ? (
                <TeacherStatsCard.Skeleton />
              ) : (
                <TeacherStatsCard data={data.teacherStats} />
              )}
            </div>

            <div className="lsg:col-span-1">
              {loading.teacher ? (
                <PendingVerificationCard.Skeleton />
              ) : (
                <PendingVerificationCard data={data.pendingVerifications} />
              )}
            </div>

            <div className="lg:col-span-3 lg:col-start-1">
              <QuickActionsCard data={{}} />
            </div>
          </div>
        )}

        {/* Ekoskop section */}
        {isEkoskop && (
          <div className="space-y-6">
            {/* Quick Actions for Ekoskop */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Szybkie akcje
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href="/ekoskop/schools"
                  className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
                >
                  <div className="text-2xl">🏫</div>
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Zarządzaj szkołami
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      Przeglądaj i edytuj szkoły
                    </div>
                  </div>
                </a>

                <a
                  href="/ekoskop/users"
                  className="flex items-center gap-3 rounded-lg bg-green-50 p-4 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40"
                >
                  <div className="text-2xl">👥</div>
                  <div>
                    <div className="font-medium text-green-900 dark:text-green-100">
                      Zarządzaj użytkownikami
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                      Weryfikuj i moderuj
                    </div>
                  </div>
                </a>

                <a
                  href="/ekoskop/articles"
                  className="flex items-center gap-3 rounded-lg bg-purple-50 p-4 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40"
                >
                  <div className="text-2xl">📝</div>
                  <div>
                    <div className="font-medium text-purple-900 dark:text-purple-100">
                      Artykuły edukacyjne
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">
                      Twórz i publikuj
                    </div>
                  </div>
                </a>

                <a
                  href="/ekoskop/statistics"
                  className="flex items-center gap-3 rounded-lg bg-orange-50 p-4 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40"
                >
                  <div className="text-2xl">📊</div>
                  <div>
                    <div className="font-medium text-orange-900 dark:text-orange-100">
                      Statystyki globalne
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">
                      Przegląd systemu
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* System Overview */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Zarządzanie</p>
                    <p className="text-lg font-bold">Szkoły & Klasy</p>
                  </div>
                  <div className="text-3xl opacity-80">🏫</div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Treści</p>
                    <p className="text-lg font-bold">EkoDziałania & Odznaki</p>
                  </div>
                  <div className="text-3xl opacity-80">🌱</div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Edukacja</p>
                    <p className="text-lg font-bold">Artykuły & Materiały</p>
                  </div>
                  <div className="text-3xl opacity-80">📚</div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Analityka</p>
                    <p className="text-lg font-bold">Raporty & Statystyki</p>
                  </div>
                  <div className="text-3xl opacity-80">📈</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student section (visible for non-teachers and non-ekoskop) */}
        {!isTeacher && !isEkoskop && (
          <div className="flex flex-col gap-6 lg:mb-0 lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              {loading.ecoChallenge ? (
                <LargeChallengeCard.Skeleton />
              ) : (
                <LargeChallengeCard data={challengeCardData} />
              )}
            </div>

            <div className="lg:col-span-2">
              {loading.ecoActions ? (
                <ActionsCarousel.Skeleton />
              ) : (
                <ActionsCarousel data={data.ecoActions ?? []} />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
