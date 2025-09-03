import { useAuth } from "../contexts/AuthContext";
import { useEffect, useMemo } from "react";
import useActiveEcoChallenge from "../hooks/useActiveEcoChallenge";
import useLimitedEcoActions from "../hooks/useLimitedEcoActions";
import useTeacherDashboard from "../hooks/useTeacherDashboard";
import LargeChallengeCard from "../components/dashboard/LargeChallengeCard";
import ActionsCarousel from "../components/dashboard/ActionsCarousel";
import TeacherStatsCard from "../components/dashboard/TeacherStatsCard";
import PendingVerificationCard from "../components/dashboard/PendingVerificationCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import { useToast } from "../contexts/ToastContext";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const isTeacher = useMemo(
    () => currentUser?.role === "teacher",
    [currentUser?.role],
  );

  const {
    data: ecoChallenge,
    loading: loadingAssigned,
    error: ecoChallengeError,
  } = useActiveEcoChallenge(!!currentUser?.classId && !isTeacher);

  const {
    data: ecoActions,
    loading: loadingEcoActions,
    error: ecoActionsError,
  } = useLimitedEcoActions(!isTeacher, 3);

  const {
    stats: teacherStats,
    pendingVerifications,
    loading: loadingTeacher,
    error: teacherError,
  } = useTeacherDashboard(isTeacher, currentUser?.classId);

  useEffect(() => {
    if (ecoChallengeError) {
      toast.show?.({
        title: "Błąd",
        description: "Nie udało się pobrać aktywnego wyzwania",
      });
    }
  }, [ecoChallengeError, toast]);

  useEffect(() => {
    if (ecoActionsError) {
      toast.show?.({
        title: "Błąd",
        description: "Nie udało się pobrać szybkich akcji",
      });
    }
  }, [ecoActionsError, toast]);

  useEffect(() => {
    if (teacherError) {
      toast.show?.({
        title: "Błąd",
        description: "Nie udało się pobrać danych nauczyciela",
      });
    }
  }, [teacherError, toast]);
  const headerText = isTeacher
    ? "Witaj w panelu nauczyciela — tutaj zobaczysz statystyki klasy, zgłoszenia do weryfikacji i szybkie akcje."
    : "Witaj na stronie głównej — tutaj zobaczysz aktualne wyzwania, szybkie działania i swój postęp.";

  const challengeCardData = useMemo(() => {
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
  }, [ecoChallenge]);

  return (
    <>
      <DashboardHeader name={currentUser?.displayName} text={headerText} />

      {/* Teacher-only section */}
      {isTeacher && (
        <div className="mb-6 flex flex-col gap-6 lg:mb-0 lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            {loadingTeacher ? (
              <TeacherStatsCard.Skeleton />
            ) : (
              <TeacherStatsCard data={teacherStats} />
            )}
          </div>

          <div className="lg:col-span-1">
            {loadingTeacher ? (
              <PendingVerificationCard.Skeleton />
            ) : (
              <PendingVerificationCard data={pendingVerifications} />
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
            {loadingAssigned ? (
              <LargeChallengeCard.Skeleton />
            ) : (
              <LargeChallengeCard data={challengeCardData} />
            )}
          </div>

          <div className="lg:col-span-2">
            {loadingEcoActions ? (
              <ActionsCarousel.Skeleton />
            ) : (
              <ActionsCarousel data={ecoActions ?? []} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
