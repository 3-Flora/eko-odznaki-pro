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

  const headerText = isTeacher
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
        />

        {/* Teacher-only section */}
        {isTeacher && (
          <div className="mb-6 flex flex-col gap-6 lg:mb-0 lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              {loading.teacher ? (
                <TeacherStatsCard.Skeleton />
              ) : (
                <TeacherStatsCard data={data.teacherStats} />
              )}
            </div>

            <div className="lg:col-span-1">
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

        {/* Student section (visible for non-teachers) */}
        {!isTeacher && (
          <div className="mb-6 flex flex-col gap-6 lg:mb-0 lg:grid lg:grid-cols-3 lg:gap-6">
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
