import clsx from "clsx";

export default function Badge({
  icon,
  name,
  description,
  color,
  lvl,
  progress,
  progressText,
  nextLevelData,
  isEarned = true,
  badgeImage = "",
}) {
  const getColorClasses = () => {
    if (!isEarned) {
      return "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-gray-400";
    }
    return "bg-gradient-to-br from-green-700 to-emerald-800 text-white";
  };

  badgeImage ? console.log(badgeImage) : null;

  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-2xl",
        getColorClasses(),
      )}
    >
      <div className="relative p-4">
        <div className="mb-4 flex flex-row justify-between">
          {/* Badge Icon */}
          {badgeImage ? (
            <>
              <img
                src={`/badges/${badgeImage}`}
                className={clsx(
                  "h-18 w-18 object-cover",
                  lvl === 0 && "grayscale filter",
                  lvl === 1 &&
                    "brightness-100 contrast-110 saturate-150 sepia filter",
                  lvl === 2 && "brightness-125 contrast-150 grayscale filter",
                  lvl === 3 &&
                    "brightness-110 contrast-125 saturate-150 sepia filter",
                  lvl === 4 &&
                    "brightness-110 contrast-125 hue-rotate-180 saturate-150 filter",
                )}
              />
            </>
          ) : (
            <>
              <div className="mr-4 flex">
                <div
                  className={clsx(
                    "flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-all duration-300",
                    isEarned ? "bg-white/20" : "bg-gray-300 dark:bg-gray-600",
                  )}
                >
                  {/* Glow effect for earned badges */}
                  {isEarned && (
                    <div className="absolute rounded-2xl bg-white/20"></div>
                  )}
                  <span className="relative z-10">{icon}</span>
                </div>
              </div>
            </>
          )}

          {/* Badge Info */}
          <div className="text-right">
            <h4 className="mb-2 text-lg leading-tight font-bold">{name}</h4>

            {description && (
              <p className="mb-4 line-clamp-2 text-sm opacity-80">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Progress Section with level */}
        <div className="space-y-3">
          {/* Progress to next level for earned badges */}
          {nextLevelData && isEarned && (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-medium">
                <span>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 font-bold",
                      isEarned
                        ? "bg-white/25 backdrop-blur-sm"
                        : "bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-300",
                    )}
                  >
                    <span className="text-xs opacity-75">LVL</span>
                    <span className="ml-1">{lvl || 0}</span>
                  </span>
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm">
                  {progressText}
                </span>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
                <div
                  className={clsx(
                    "h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700 ease-out",
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Progress for unearned badges */}
          {!isEarned && nextLevelData && (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>Do zdobycia</span>
                </span>
                <span className="rounded-full bg-gray-500 px-2 py-0.5 text-white dark:bg-gray-600">
                  {progressText}
                </span>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
              </div>
            </div>
          )}

          {/* Max level achieved */}
          {isEarned && !nextLevelData && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-bold text-amber-900 shadow-lg">
                <span>🏆</span>
                <span>MAKSYMALNY POZIOM</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
