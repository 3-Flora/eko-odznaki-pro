import { useAuth } from "../../contexts/AuthContext";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { availableBadges } from "../../data/badges";

export default function DashboardPage() {
  const { currentUser } = useAuth();

  // Mock recent activities for now
  const recentActivities = [
    {
      id: "1",
      userName: "Anna K.",
      title: "Przejazd rowerem do szkoły",
      points: 10,
      submittPagedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: "2",
      userName: "Piotr M.",
      title: "Segregacja śmieci",
      points: 15,
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      reviewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
  ];

  // Find next badge
  const nextBadge = availableBadges
    .filter((badge) => (currentUser?.points || 0) < badge.pointsRequired)
    .sort((a, b) => a.pointsRequired - b.pointsRequired)[0];

  const nextBadgePoints = nextBadge?.pointsRequired || 50;
  const currentStreak = 5; // TODO: Calculate from user data
  const weeklyProgress = Math.min(
    ((currentUser?.points || 0) / 100) * 100,
    100,
  ); // Weekly goal of 100 points

  return (
    <>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white dark:bg-gradient-to-r dark:from-green-700 dark:to-emerald-900 dark:text-white"
      >
        <h2 className="mb-2 text-2xl font-bold">
          Cześć, {currentUser?.displayName?.split(" ")[0]}! 👋
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Masz już <span className="font-bold">{currentUser?.points || 0}</span>{" "}
          punktów eco!
        </p>
        <div className="flex items-center">
          <div className="mr-2 rounded-full bg-white/20 px-3 py-1 dark:bg-white/10">
            <span className="text-sm font-semibold">
              Streak: {currentStreak} dni 🔥
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress to Next Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Kolejna odznaka
          </h3>
          <div className="text-2xl">🏆</div>
        </div>
        <div className="mb-2">
          <div className="mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>
              {currentUser?.points || 0} / {nextBadgePoints} punktów
            </span>
            <span>
              {Math.round(((currentUser?.points || 0) / nextBadgePoints) * 100)}
              %
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 dark:from-green-600 dark:to-emerald-700"
              style={{
                width: `${Math.min(
                  ((currentUser?.points || 0) / nextBadgePoints) * 100,
                  100,
                )}%`,
              }}
            ></div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Jeszcze {Math.max(0, nextBadgePoints - (currentUser?.points || 0))}{" "}
          punktów do odznaki "{nextBadge?.name || "następnej odznaki"}"!
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white p-4 text-center shadow-lg dark:bg-gray-800"
        >
          <div className="mb-2 text-3xl">🎯</div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {weeklyProgress}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Tygodniowy cel
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-4 text-center shadow-lg dark:bg-gray-800"
        >
          <div className="mb-2 text-3xl">🌱</div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {currentUser?.badges?.length || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Zdobyte odznaki
          </p>
        </motion.div>
      </div>

      {/* Recent Class Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Aktywność klasy
          </h3>
          <Users className="h-5 w-5 text-gray-400 dark:text-gray-300" />
        </div>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl">🌱</div>
              <p className="text-gray-600 dark:text-gray-300">
                Brak aktywności w klasie
              </p>
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-400">
                Zachęć uczniów do zgłaszania działań eco!
              </p>
            </div>
          ) : (
            recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between rounded-xl bg-green-50 p-3 dark:bg-green-900"
              >
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                    <span className="text-sm font-semibold text-white">
                      {activity.userName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {activity.userName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {activity.title}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600 dark:text-green-300">
                    +{activity.points} pkt
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-400">
                    {activity.reviewedAt
                      ? new Date(activity.reviewedAt).toLocaleDateString(
                          "pl-PL",
                        )
                      : new Date(activity.submittedAt).toLocaleDateString(
                          "pl-PL",
                        )}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Current Weekly Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 p-6 text-white dark:from-blue-800 dark:to-cyan-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">
            Wyzwanie tygodnia
          </h3>
          <div className="text-2xl">⚡</div>
        </div>
        <h4 className="mb-2 text-xl font-bold dark:text-white">
          Tydzień bez plastiku
        </h4>
        <p className="mb-4 text-blue-100 dark:text-blue-200">
          Unikaj jednorazowych przedmiotów plastikowych przez cały tydzień
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm">Bonus: +50 punktów</span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm dark:bg-white/10">
            Pozostało 3 dni
          </span>
        </div>
      </motion.div>
    </>
  );
}
