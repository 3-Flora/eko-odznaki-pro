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
} from "firebase/firestore";
import { db } from "../services/firebase";
import LargeChallengeCard from "../components/dashboard/LargeChallengeCard";
import ActionsCarousel from "../components/dashboard/ActionsCarousel";
import ProgressCard from "../components/dashboard/ProgressCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";

export default function DashboardPage() {
  const { currentUser } = useAuth();

  // prefer real user from context when available, otherwise use static sample
  const user = currentUser || { displayName: "Nie zalogowany" };

  // Live data states
  const [assignedChallenge, setAssignedChallenge] = useState(null);
  const [ecoActions, setEcoActions] = useState(null);
  const [feedItems, setFeedItems] = useState(null);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [loadingEcoActions, setLoadingEcoActions] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Fetch assigned challenge for the user's class (current active one)
  useEffect(() => {
    if (!currentUser?.classId) return;

    let mounted = true;
    setLoadingAssigned(true);
    (async () => {
      try {
        const now = new Date();
        const q = query(
          collection(db, "assignedChallenges"),
          where("classId", "==", currentUser.classId),
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
  }, [currentUser?.classId]);

  // Fetch ecoActions (small list for quick actions)
  useEffect(() => {
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
  }, []);

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

  return (
    <>
      {/* Top welcome */}
      <div className="rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white dark:from-green-700 dark:to-emerald-900">
        <h2 className="mb-2 text-2xl font-bold">
          Cześć, {user.displayName.split(" ")[0]}! 👋
        </h2>
        <p className="text-sm text-white/90">
          Witaj na stronie głównej — tutaj zobaczysz aktualne wyzwania, szybkie
          działania i swój postęp.
        </p>
      </div>

      {/* Render sections explicitly (prefer live DB data, fallback to static samples) */}
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

      {loadingFeed ? (
        <ProgressCard.Skeleton />
      ) : (
        <ProgressCard data={{ user }} />
      )}

      {loadingFeed ? (
        <ActivityFeed.Skeleton />
      ) : (
        <ActivityFeed data={{ feedItems: feedItems || feedData.feedItems }} />
      )}
    </>
  );
}
