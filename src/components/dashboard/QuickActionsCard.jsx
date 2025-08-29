import { BarChart3, TrendingUp, Users, Award } from "lucide-react";
import { useNavigate } from "react-router";

export default function QuickActionsCard({ data }) {
  const navigate = useNavigate();

  if (!data) return <QuickActionsCard.Skeleton />;

  const actions = [
    {
      title: "Zobacz statystyki",
      description: "Szczegółowy przegląd klasy",
      icon: BarChart3,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => navigate("/teacher/statistics"),
    },
    {
      title: "Sprawdź zgłoszenia",
      description: "Weryfikuj EkoDziałania",
      icon: TrendingUp,
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => navigate("/teacher/submissions"),
    },
    {
      title: "Zarządzaj uczniami",
      description: "Lista uczniów klasy",
      icon: Users,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => navigate("/teacher/students"),
    },
  ];

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Szybkie akcje
        </h3>
      </div>

      <div className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              onClick={action.onClick}
              className={`${action.color} group rounded-xl p-4 text-left text-white shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6" />
                <div>
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-sm text-white/80">
                    {action.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

QuickActionsCard.Skeleton = function QuickActionsCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
        <div className="h-6 w-28 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
      </div>

      <div className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
              <div>
                <div className="mb-1 h-5 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
