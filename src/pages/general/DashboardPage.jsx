import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useMemo } from "react";
import useDashboardData from "../../hooks/useDashboardData";
import LargeChallengeCard from "../../components/dashboard/LargeChallengeCard";
import ActionsCarousel from "../../components/dashboard/ActionsCarousel";
import TeacherStatsCard from "../../components/dashboard/TeacherStatsCard";
import PendingVerificationCard from "../../components/dashboard/PendingVerificationCard";
import QuickActionsCard from "../../components/dashboard/QuickActionsCard";
import { useToast } from "../../contexts/ToastContext";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { useNavigate } from "react-router";
import { useRegisterRefresh } from "../../contexts/RefreshContext";
import PullToRefreshWrapper from "../../components/refresh/PullToRefreshWrapper";
import clsx from "clsx";

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

  // Rejestrujemy funkcję odświeżania w globalnym systemie
  useRegisterRefresh("dashboard", refreshAll);

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
    <PullToRefreshWrapper onRefresh={refreshAll} threshold={80} enabled={true}>
      <div>
        <DashboardHeader
          name={currentUser?.displayName}
          text={headerText}
          isRefreshing={false}
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
            {/* System Overview */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Zarządzanie"
                subtitle="Szkoły & Klasy"
                emoji="🏫"
                className="from-blue-500 to-blue-600"
                href="ekoskop/schools"
              />
              <DashboardCard
                title="Treści"
                subtitle="EkoDziałania & Odznaki"
                emoji="🌱"
                className="from-green-500 to-green-600"
                href="ekoskop/badges"
              />

              <DashboardCard
                title="Użytkownicy"
                subtitle="Zarządzanie Użytkownikami"
                emoji="📲"
                className="from-teal-500 to-teal-600"
                href="ekoskop/users"
              />

              <DashboardCard
                title="Edukacja"
                subtitle="Artykuły & Materiały"
                emoji="📚"
                className="from-purple-500 to-purple-600"
                href="ekoskop/articles"
              />

              <DashboardCard
                title="Analityka"
                subtitle="Raporty & Statystyki"
                emoji="📈"
                className="from-orange-500 to-orange-600"
                href="ekoskop/statistics"
              />
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
    </PullToRefreshWrapper>
  );
}

function DashboardCard({ title, subtitle, emoji, className, href }) {
  const navigate = useNavigate();

  return (
    <div
      className={clsx(
        "cursor-pointer rounded-2xl bg-gradient-to-br p-6 text-white",
        className,
      )}
      onClick={() => navigate(href)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100">{title}</p>
          <p className="text-lg font-bold">{subtitle}</p>
        </div>
        <div className="text-3xl opacity-80">{emoji}</div>
      </div>
    </div>
  );
}
