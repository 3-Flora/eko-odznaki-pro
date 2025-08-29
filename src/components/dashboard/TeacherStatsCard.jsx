import { Users, Calendar, Award, Leaf, TrendingUp } from "lucide-react";
import clsx from "clsx";

export default function TeacherStatsCard({ data }) {
  if (!data) return <TeacherStatsCard.Skeleton />;

  const { classStats, studentsCount } = data;

  const stats = [
    {
      label: "Uczniowie",
      value: studentsCount,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "EkoDziałania",
      value: classStats.totalActions,
      icon: Leaf,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Wyzwania",
      value: classStats.totalChallenges,
      icon: Award,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Aktywne dni",
      value: classStats.totalActiveDays,
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Statystyki klasy
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={clsx(
                "rounded-xl p-4 transition-all duration-200",
                stat.bgColor,
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={clsx("h-6 w-6", stat.color)} />
                <div>
                  <div className={clsx("text-2xl font-bold", stat.color)}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

TeacherStatsCard.Skeleton = function TeacherStatsCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
        <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
              <div>
                <div className="mb-1 h-6 w-8 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
