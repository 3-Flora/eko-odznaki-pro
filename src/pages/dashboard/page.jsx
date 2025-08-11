import React from "react";
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
    100
  ); // Weekly goal of 100 points

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 justify-normal">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl"
      >
        <h2 className="mb-2 text-2xl font-bold">
          Cześć, {currentUser?.displayName?.split(" ")[0]}! 👋
        </h2>
        <p className="mb-4 text-gray-600">
          Masz już <span className="font-bold">{currentUser?.points || 0}</span>{" "}
          punktów eco!
        </p>
        <div className="flex items-center">
          <div className="px-3 py-1 mr-2 rounded-full bg-white/20">
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
        className="p-6 bg-white shadow-lg rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Kolejna odznaka
          </h3>
          <div className="text-2xl">🏆</div>
        </div>
        <div className="mb-2">
          <div className="flex justify-between mb-1 text-sm text-gray-600">
            <span>
              {currentUser?.points || 0} / {nextBadgePoints} punktów
            </span>
            <span>
              {Math.round(((currentUser?.points || 0) / nextBadgePoints) * 100)}
              %
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full">
            <div
              className="h-3 transition-all duration-500 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
              style={{
                width: `${Math.min(
                  ((currentUser?.points || 0) / nextBadgePoints) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>
        <p className="text-sm text-gray-600">
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
          className="p-4 text-center bg-white shadow-lg rounded-2xl"
        >
          <div className="mb-2 text-3xl">🎯</div>
          <p className="text-2xl font-bold text-gray-800">{weeklyProgress}%</p>
          <p className="text-sm text-gray-600">Tygodniowy cel</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 text-center bg-white shadow-lg rounded-2xl"
        >
          <div className="mb-2 text-3xl">🌱</div>
          <p className="text-2xl font-bold text-gray-800">
            {currentUser?.badges?.length || 0}
          </p>
          <p className="text-sm text-gray-600">Zdobyte odznaki</p>
        </motion.div>
      </div>

      {/* Recent Class Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-white shadow-lg rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Aktywność klasy
          </h3>
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl">🌱</div>
              <p className="text-gray-600">Brak aktywności w klasie</p>
              <p className="mt-2 text-sm text-gray-400">
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
                className="flex items-center justify-between p-3 bg-green-50 rounded-xl"
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-500 rounded-full">
                    <span className="text-sm font-semibold text-white">
                      {activity.userName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {activity.userName}
                    </p>
                    <p className="text-xs text-gray-600">{activity.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    +{activity.points} pkt
                  </p>
                  <p className="text-xs text-gray-400">
                    {activity.reviewedAt
                      ? new Date(activity.reviewedAt).toLocaleDateString(
                          "pl-PL"
                        )
                      : new Date(activity.submittedAt).toLocaleDateString(
                          "pl-PL"
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
        className="p-6 text-white bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Wyzwanie tygodnia</h3>
          <div className="text-2xl">⚡</div>
        </div>
        <h4 className="mb-2 text-xl font-bold">Tydzień bez plastiku</h4>
        <p className="mb-4 text-blue-100">
          Unikaj jednorazowych przedmiotów plastikowych przez cały tydzień
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm">Bonus: +50 punktów</span>
          <span className="px-3 py-1 text-sm rounded-full bg-white/20">
            Pozostało 3 dni
          </span>
        </div>
      </motion.div>
    </div>
  );
}
