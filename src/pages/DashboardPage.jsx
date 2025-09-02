import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { getActiveEcoChallenge } from "../services/ecoChallengeService";
import { getLimitedEcoActions } from "../services/ecoActionService";
import {
  getTeacherClassStats,
  getPendingVerifications,
} from "../services/teacherService";
import LargeChallengeCard from "../components/dashboard/LargeChallengeCard";
import ActionsCarousel from "../components/dashboard/ActionsCarousel";
import TeacherStatsCard from "../components/dashboard/TeacherStatsCard";
import PendingVerificationCard from "../components/dashboard/PendingVerificationCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import { useToast } from "../contexts/ToastContext";

export default function DashboardPage() {
  const { currentUser } = useAuth();

  const isTeacher = currentUser?.role === "teacher";

  // Live data states for students
  const [ecoChallenge, setEcoChallenge] = useState(null);
  const [ecoActions, setEcoActions] = useState(null);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [loadingEcoActions, setLoadingEcoActions] = useState(true);

  // Teacher-specific data states
  const [teacherStats, setTeacherStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState(null);
  const [loadingTeacherStats, setLoadingTeacherStats] = useState(true);
  const [loadingPendingVerifications, setLoadingPendingVerifications] =
    useState(true);

  // Fetch assigned challenge for the user's class (current active one) - only for students
  useEffect(() => {
    if (!currentUser?.classId || isTeacher) return;

    let mounted = true;
    setLoadingAssigned(true);

    (async () => {
      try {
        const activeChallenge = await getActiveEcoChallenge();
        if (mounted && activeChallenge) {
          setEcoChallenge(activeChallenge);
        }
      } catch (error) {
        console.warn("failed to fetch active eco challenge", error);
      }
      if (mounted) setLoadingAssigned(false);
    })();

    return () => {
      mounted = false;
    };
  }, [currentUser?.classId, isTeacher]);

  // Fetch ecoActions (small list for quick actions) - only for students
  useEffect(() => {
    if (isTeacher) return;

    let mounted = true;
    setLoadingEcoActions(true);

    (async () => {
      try {
        const limitedActions = await getLimitedEcoActions(3);
        if (mounted) {
          setEcoActions(limitedActions);
        }
      } catch (error) {
        console.warn("failed to fetch eco actions", error);
      }
      if (mounted) setLoadingEcoActions(false);
    })();

    return () => {
      mounted = false;
    };
  }, [isTeacher]);

  // Fetch teacher statistics
  useEffect(() => {
    if (!isTeacher || !currentUser?.classId) return;

    let mounted = true;
    setLoadingTeacherStats(true);

    (async () => {
      try {
        const stats = await getTeacherClassStats(currentUser.classId);
        if (mounted) {
          setTeacherStats(stats);
        }
      } catch (error) {
        console.warn("failed to fetch teacher stats", error);
      }
      if (mounted) setLoadingTeacherStats(false);
    })();

    return () => {
      mounted = false;
    };
  }, [isTeacher, currentUser?.classId]);

  // Fetch pending verifications for teacher
  useEffect(() => {
    if (!isTeacher || !currentUser?.classId) return;

    let mounted = true;
    setLoadingPendingVerifications(true);

    (async () => {
      try {
        const verifications = await getPendingVerifications(
          currentUser.classId,
        );
        if (mounted) {
          setPendingVerifications(verifications);
        }
      } catch (error) {
        console.warn("failed to fetch pending verifications", error);
      }
      if (mounted) setLoadingPendingVerifications(false);
    })();

    return () => {
      mounted = false;
    };
  }, [isTeacher, currentUser?.classId]);

  return (
    <>
      {isTeacher ? (
        <>
          <DashboardHeader
            name={currentUser.displayName}
            text="Witaj w panelu nauczyciela — tutaj zobaczysz statystyki klasy, zgłoszenia do weryfikacji i szybkie akcje."
          />
          {/* Teacher View */}
          {loadingTeacherStats ? (
            <TeacherStatsCard.Skeleton />
          ) : (
            <TeacherStatsCard data={teacherStats} />
          )}

          {loadingPendingVerifications ? (
            <PendingVerificationCard.Skeleton />
          ) : (
            <PendingVerificationCard data={pendingVerifications} />
          )}

          <QuickActionsCard data={{}} />
        </>
      ) : (
        <>
          {/* Student View */}
          <DashboardHeader
            name={currentUser.displayName}
            text="Witaj na stronie głównej — tutaj zobaczysz aktualne wyzwania, szybkie działania i swój postęp."
          />
          {loadingAssigned ? (
            <LargeChallengeCard.Skeleton />
          ) : (
            <LargeChallengeCard data={ecoChallenge} />
          )}

          {loadingEcoActions ? (
            <ActionsCarousel.Skeleton />
          ) : (
            <ActionsCarousel data={[...ecoActions]} />
          )}
        </>
      )}
    </>
  );
}

function DashboardHeader({ name, text }) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white dark:from-green-700 dark:to-emerald-900">
      <h2 className="mb-2 text-2xl font-bold">
        Cześć, {name.split(" ")[0]}! 👋
      </h2>
      <p className="text-white/90">{text}</p>
    </div>
  );
}
