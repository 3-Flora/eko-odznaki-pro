import { useAuth } from "../../contexts/AuthContext";
import { CalendarClockIcon, Pickaxe, Users } from "lucide-react";
import { motion } from "framer-motion";
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
import { db } from "../../services/firebase";
import { useNavigate } from "react-router";

// Static fallback progress data (used when currentUser doesn't provide badge/rank yet)
const staticProgressData = {
  user: { displayName: "Jan Kowalski", avatarUrl: "" },
  rank: { position: 5, totalInClass: 25, label: "Miejsce w klasie" },
  featuredBadge: {
    name: "Eko-Aktywista",
    level: 1,
    imageUrl: "",
    progress: { current: 23, target: 25, label: "do poziomu 2" },
  },
  callToAction: { text: "Zobacz pełny profil", action: "NAVIGATE_TO_PROFILE" },
};

// --- Skeleton components ---
function LargeChallengeCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-gray-100 p-6 dark:bg-gray-800">
      <div className="mb-3 h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mb-6 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

function ActionsCarouselSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
      <div className="mb-3 h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex space-x-3">
        <div className="h-24 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-24 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-24 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

function ProgressCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-4 h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="mb-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-4 h-6 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LargeChallengeCard({ data }) {
  const end = new Date(data.endDate.seconds * 1000);
  const now = new Date();
  const msLeft = Math.max(0, end - now);
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
  const progressPct = Math.round(
    (data.classProgress.current / data.classProgress.total) * 100,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-gradient-to-r from-blue-400 to-cyan-500 p-6 text-white dark:from-blue-800 dark:to-cyan-900 dark:text-white"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-2xl font-bold">{data.challengeName}</h4>
          <p className="mt-2 text-sm text-blue-100 dark:text-blue-200">
            {data.challengeDescription}
          </p>
        </div>
        <div className="flex items-center justify-items-center gap-2 text-right">
          {/* <div className="text-sm"></div> */}
          <CalendarClockIcon className="h-5 w-5 text-white" />
          <div className="font-semibold">{end.toLocaleDateString("pl-PL")}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="w-2/3">
          <div className="mb-1 flex items-center justify-between text-sm text-blue-100 dark:text-blue-200">
            <span>
              {data.classProgress.current} / {data.classProgress.total} uczniów
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/30 dark:bg-white/10">
            <div
              className="h-3 rounded-full bg-white transition-all duration-500 dark:bg-emerald-400"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>
        <div className="ml-4 text-sm dark:text-blue-100">
          <div className="mb-1">Pozostało</div>
          <div className="rounded-full bg-white/20 px-3 py-1 font-semibold dark:bg-white/10">
            {daysLeft} dni
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => console.log("DO IT")}
          className="rounded-full bg-white/20 px-4 py-2 font-semibold hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
        >
          Wykonaj działanie
        </button>
      </div>
    </motion.div>
  );
}

function ActionsCarousel({ data }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Szybkie Działania
        </h3>
        <button
          onClick={() => navigate("/submit")}
          className="text-sm text-gray-500 dark:text-gray-300"
        >
          Zobacz wszystkie
        </button>
      </div>

      <div className="flex space-x-3 overflow-x-auto pb-2">
        {data.actions.map((action) => (
          <div
            key={action.id}
            className="min-w-[160px] flex-none rounded-xl border bg-white p-3 text-left dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-2 flex justify-center">
              <div className="flex flex-col">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white dark:bg-green-600">
                  {/* icon */}
                  <span className="text-4xl">{action.icon}</span>
                </div>
                <div className="text-xl font-medium text-gray-800 dark:text-white">
                  {action.name}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <button
                // tutaj przekierowywujne na /submit z wybranym EkoDziałaniem
                onClick={() => console.log("quick action", action)}
                className="w-full rounded-md bg-green-500 px-3 py-1 text-sm font-semibold text-white hover:bg-green-600"
              >
                Wykonaj
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProgressCard({ data }) {
  const badgePct = Math.round(
    (data.featuredBadge.progress.current / data.featuredBadge.progress.target) *
      100,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Mój Postęp
        </h3>
        <Pickaxe className="h-5 w-5 text-gray-400 dark:text-gray-300" />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold dark:bg-gray-700 dark:text-white">
          {data.user.displayName[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-white">
                {data.user.displayName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {data.rank.label}: {data.rank.position}/{data.rank.totalInClass}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Odznaka
              </div>
              <div className="font-semibold dark:text-white">
                {data.featuredBadge.name} (Lv {data.featuredBadge.level})
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
              <span>
                {data.featuredBadge.progress.current} /{" "}
                {data.featuredBadge.progress.target}{" "}
                {data.featuredBadge.progress.label}
              </span>
              <span>{badgePct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"
                style={{ width: `${Math.min(badgePct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => console.log(data.callToAction)}
          className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600 dark:bg-emerald-500"
        >
          {data.callToAction.text}
        </button>
      </div>
    </motion.div>
  );
}

function ActivityFeed({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Co słychać w klasie?
        </h3>
        <Users className="h-5 w-5 text-gray-400 dark:text-gray-300" />
      </div>

      <p className="mb-2 text-gray-600 dark:text-gray-400">
        Tutaj znajdziesz ostatnie aktywności i działania w klasie.
      </p>

      <div className="space-y-3">
        {data.feedItems.map((item, i) => (
          <div key={item.id} className="flex items-start space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 font-semibold text-white dark:bg-green-600">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-800 dark:text-white">
                {item.text}
              </div>
              <div className="mt-1 text-xs text-gray-400 dark:text-gray-400">
                {new Date(item.timestamp).toLocaleString("pl-PL")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();

  // prefer real user from context when available, otherwise use static sample
  const user = currentUser || { displayName: "Jan Kowalski" };

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white dark:from-green-700 dark:to-emerald-900"
      >
        <h2 className="mb-2 text-2xl font-bold">
          Cześć, {user.displayName.split(" ")[0]}! 👋
        </h2>
        <p className="text-sm text-white/90">
          Witaj na stronie głównej — tutaj zobaczysz aktualne wyzwania, szybkie
          działania i swój postęp.
        </p>
      </motion.div>

      {/* Render sections explicitly (prefer live DB data, fallback to static samples) */}
      {loadingAssigned ? (
        <LargeChallengeCardSkeleton />
      ) : (
        <LargeChallengeCard data={assignedChallenge || heroData} />
      )}

      {loadingEcoActions ? (
        <ActionsCarouselSkeleton />
      ) : (
        <ActionsCarousel
          data={{
            actions: ecoActions.map((a) => ({
              id: a.id,
              name: a.name,
              icon: a.icon || "🍃",
              action: "SUBMIT_ACTION_QUICKLY",
              actionId: a.id,
            })),
          }}
        />
      )}

      {/* Progress card doesn't rely on async DB in this implementation, but show skeleton briefly if desired */}
      <ProgressCard
        data={
          staticProgressData.user
            ? staticProgressData
            : { ...progressData, user }
        }
      />

      {loadingFeed ? (
        <ActivityFeedSkeleton />
      ) : (
        <ActivityFeed data={{ feedItems: feedItems || feedData.feedItems }} />
      )}
    </>
  );
}
