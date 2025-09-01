import { useAuth } from "../contexts/AuthContext";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import LargeChallengeCard from "../components/dashboard/LargeChallengeCard";
import ActionsCarousel from "../components/dashboard/ActionsCarousel";
import ProgressCard from "../components/dashboard/ProgressCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import TeacherStatsCard from "../components/dashboard/TeacherStatsCard";
import PendingVerificationCard from "../components/dashboard/PendingVerificationCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import { useToast } from "../contexts/ToastContext";

export default function DashboardPage() {
  const { currentUser } = useAuth();

  const { showError, showSuccess } = useToast();

  // prefer real user from context when available, otherwise use static sample
  const user = currentUser || { displayName: "Nie zalogowany" };

  // Determine if user is a teacher
  const isTeacher = currentUser?.role === "teacher";

  // Live data states for students
  const [assignedChallenge, setAssignedChallenge] = useState(null);
  const [ecoActions, setEcoActions] = useState(null);
  const [feedItems, setFeedItems] = useState(null);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [loadingEcoActions, setLoadingEcoActions] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);

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
        const now = new Date();
        const q = query(
          collection(db, "assignedChallenges"),
          // where("classId", "==", currentUser.classId),
          orderBy("endDate", "desc"),
          limit(5),
        );
        const snap = await getDocs(q);
        // find active one (startDate <= now <= endDate)
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const active = items.find((it) => {
          const start = it.startDate
            ? it.startDate.toDate?.() || new Date(it.startDate)
            : new Date(0);
          const end = it.endDate
            ? it.endDate.toDate?.() || new Date(it.endDate)
            : new Date(0);
          return start <= now && now <= end;
        });
        if (mounted && active) setAssignedChallenge(active);
      } catch (e) {
        console.warn("failed to fetch assignedChallenges", e);
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
        const q = query(
          collection(db, "ecoActions"),
          orderBy("name"),
          limit(10),
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (mounted) setEcoActions(items.slice(0, 3));
      } catch (e) {
        console.warn("failed to fetch ecoActions", e);
      }
      if (mounted) setLoadingEcoActions(false);
    })();
    return () => {
      mounted = false;
    };
  }, [isTeacher]);

  // Subscribe to activity feed for the class
  useEffect(() => {
    if (!currentUser?.classId) return;
    const feedCol = collection(
      db,
      "activityFeeds",
      currentUser.classId,
      "items",
    );
    const q = query(feedCol, orderBy("timestamp", "desc"), limit(10));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setFeedItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingFeed(false);
      },
      (err) => console.warn("feed listener error", err),
    );
    return () => unsub();
  }, [currentUser?.classId]);

  // Fetch teacher statistics
  useEffect(() => {
    if (!isTeacher || !currentUser?.classId) return;

    let mounted = true;
    setLoadingTeacherStats(true);

    (async () => {
      try {
        // Get class information
        const classDoc = await getDoc(doc(db, "classes", currentUser.classId));
        let className = "";
        let schoolName = "";

        if (classDoc.exists()) {
          const classData = classDoc.data();
          className = classData.name || "";

          // Get school information
          if (classData.schoolId) {
            const schoolDoc = await getDoc(
              doc(db, "schools", classData.schoolId),
            );
            if (schoolDoc.exists()) {
              schoolName = schoolDoc.data().name || "";
            }
          }
        }

        // Get students from this class
        const studentsQuery = query(
          collection(db, "users"),
          where("classId", "==", currentUser.classId),
          where("role", "==", "student"),
          where("isVerified", "==", true),
        );

        const studentsSnapshot = await getDocs(studentsQuery);
        const students = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate class statistics
        const classStats = students.reduce(
          (acc, student) => {
            const counters = student.counters || {};
            return {
              totalActions: acc.totalActions + (counters.totalActions || 0),
              totalChallenges:
                acc.totalChallenges + (counters.totalChallenges || 0),
              totalActiveDays:
                acc.totalActiveDays + (counters.totalActiveDays || 0),
              recyclingActions:
                acc.recyclingActions + (counters.recyclingActions || 0),
              educationActions:
                acc.educationActions + (counters.educationActions || 0),
              savingActions: acc.savingActions + (counters.savingActions || 0),
              transportActions:
                acc.transportActions + (counters.transportActions || 0),
              energyActions: acc.energyActions + (counters.energyActions || 0),
              foodActions: acc.foodActions + (counters.foodActions || 0),
            };
          },
          {
            totalActions: 0,
            totalChallenges: 0,
            totalActiveDays: 0,
            recyclingActions: 0,
            educationActions: 0,
            savingActions: 0,
            transportActions: 0,
            energyActions: 0,
            foodActions: 0,
          },
        );

        if (mounted) {
          setTeacherStats({
            classStats,
            studentsCount: students.length,
            className,
            schoolName,
          });
        }
      } catch (e) {
        console.warn("failed to fetch teacher stats", e);
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
        // Get pending submissions
        const submissionsQuery = query(
          collection(db, "submissions"),
          where("classId", "==", currentUser.classId),
          where("status", "in", ["pending", null]),
          limit(50),
        );

        const submissionsSnapshot = await getDocs(submissionsQuery);
        const pendingSubmissions = submissionsSnapshot.docs.length;

        // Get pending students (unverified)
        const studentsQuery = query(
          collection(db, "users"),
          where("classId", "==", currentUser.classId),
          where("role", "==", "student"),
          where("isVerified", "!=", true),
        );

        const studentsSnapshot = await getDocs(studentsQuery);
        const pendingStudents = studentsSnapshot.docs.length;

        if (mounted) {
          setPendingVerifications({
            pendingSubmissions,
            pendingStudents,
          });
        }
      } catch (e) {
        console.warn("failed to fetch pending verifications", e);
      }
      if (mounted) setLoadingPendingVerifications(false);
    })();

    return () => {
      mounted = false;
    };
  }, [isTeacher, currentUser?.classId]);

  return (
    <>
      {/* Top welcome */}
      <div className="rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white dark:from-green-700 dark:to-emerald-900">
        <h2 className="mb-2 text-2xl font-bold">
          Cześć, {user.displayName.split(" ")[0]}! 👋
        </h2>
        <p className="text-white/90">
          {isTeacher
            ? "Witaj w panelu nauczyciela — tutaj zobaczysz statystyki klasy, zgłoszenia do weryfikacji i szybkie akcje."
            : "Witaj na stronie głównej — tutaj zobaczysz aktualne wyzwania, szybkie działania i swój postęp."}
        </p>
      </div>

      {/* Render teacher-specific sections */}
      {isTeacher ? (
        <>
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

          {/* {loadingFeed ? (
            <ActivityFeed.Skeleton />
          ) : (
            <ActivityFeed data={{ feedItems: feedItems || [] }} />
          )} */}
        </>
      ) : (
        <>
          {/* Render student-specific sections */}
          {loadingAssigned ? (
            <LargeChallengeCard.Skeleton />
          ) : (
            <LargeChallengeCard data={assignedChallenge} />
          )}

          {loadingEcoActions ? (
            <ActionsCarousel.Skeleton />
          ) : (
            <ActionsCarousel data={[...ecoActions]} />
          )}
          {/* 
          {loadingFeed ? (
            <ProgressCard.Skeleton />
          ) : (
            <ProgressCard data={{ user }} />
          )} */}

          {/* {loadingFeed ? (
            <ActivityFeed.Skeleton />
          ) : (
            <ActivityFeed data={{ feedItems: feedItems || [] }} />
          )} */}
        </>
      )}
    </>
  );
}
