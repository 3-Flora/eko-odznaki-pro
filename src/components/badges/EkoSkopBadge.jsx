import { Link } from "react-router";
import { ECO_CATEGORIES } from "../../constants/ecoCategories";
import clsx from "clsx";

export default function EkoSkopBadge({ badge, handleDeleteBadge }) {
  const getCategoryInfo = (categoryName) => {
    return (
      ECO_CATEGORIES.find((cat) => cat.name === categoryName) || {
        icon: "🏆",
        color: "text-gray-600",
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
      }
    );
  };

  const categoryInfo = getCategoryInfo(badge.category);
  const maxLevel = badge.levels
    ? Math.max(...badge.levels.map((l) => l.level))
    : 0;

  return (
    <div
      key={badge.id}
      className="rounded-2xl bg-white p-4 shadow-sm ring-gray-200 hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "flex h-16 w-16 items-center justify-center rounded-xl",
              categoryInfo.bgColor,
            )}
          >
            {badge.badgeImage ? (
              <img
                src={`/badges/${badge.badgeImage}`}
                alt={badge.name}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <span className="text-3xl">🏆</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {badge.name}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {badge.category}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/ekoskop/badges/edit/${badge.id}`}
            className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
            title="Edytuj odznakę"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>

          <button
            onClick={() => handleDeleteBadge(badge.id, badge.name)}
            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
            title="Usuń odznakę"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Badge Info */}
      <div className="space-y-1">
        <div>
          <span className="text-gray-600 dark:text-gray-400">
            Sprawdza licznik:
          </span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">
            {badge.counterToCheck}
          </span>
        </div>

        <div>
          <span className="text-gray-600 dark:text-gray-400">
            Ilość poziomów:
          </span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">
            {maxLevel}{" "}
            {maxLevel === 1 ? "poziom" : maxLevel < 5 ? "poziomy" : "poziomów"}
          </span>
        </div>

        {badge.levels && badge.levels.length > 0 && (
          <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
            <div className="mb-1 text-gray-600 dark:text-gray-400">
              Pierwszy poziom:
            </div>
            <div className="">
              <span className="font-medium text-green-600 dark:text-green-400">
                {badge.levels[0].requiredCount}
              </span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">
                {badge.levels[0].description}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
