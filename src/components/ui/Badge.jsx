import clsx from "clsx";
import { useState } from "react";
import { Lock, X } from "lucide-react";

const getColorClasses = (lvl) => {
  // Szare tlo gdy lvl 0, Brazawe tlo gdy lvl 1, srebre tlo gdy lvl 2, zlote gdy lvl 3, a diamentowe gdy lvl max
  switch (lvl) {
    case 0:
      return "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-gray-400";
    case 1:
      return "bg-gradient-to-br from-brown-500 to-brown-600 text-white";
    case 2:
      return "bg-gradient-to-br from-slate-500 to-slate-600 text-white";
    case 3:
      return "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white";
    case 4:
      return "bg-gradient-to-br from-blue-500 to-blue-600 text-white";
    default:
      return "";
  }
};

// Kompaktowy komponent odznaki dla gridu (styl Duolingo)
export default function Badge({
  id,
  name,
  badgeImage,
  category,
  currentLevel,
  currentLevelData,
  nextLevel,
  nextLevelData,
  currentCount,
  isEarned,
  progress,
  progressText,
  onClick,
  template,
}) {
  // Dla zdobytych odznak, użyj ikony z aktualnego poziomu
  const currentLevelIcon = currentLevelData?.icon || "🏅";
  // Dla niezdobytych, użyj ikony pierwszego poziomu
  const nextLevelIcon = nextLevelData?.icon || "🏅";
  const icon = isEarned ? currentLevelIcon : nextLevelIcon;

  // Znajdź maksymalny poziom dla tej odznaki
  const lvl = currentLevel;
  const maxLvl = template?.levels ? Object.keys(template.levels).length : null;

  const description = isEarned
    ? currentLevelData?.description
    : nextLevelData?.description;

  const getBadgeIcon = () => (
    <img
      src={`/badges/${badgeImage}`}
      className={clsx(
        "h-full rounded-xl object-cover",
        lvl === 0 && "opacity-50 grayscale filter",
        lvl === 1 && "brightness-100 contrast-110 saturate-150 sepia filter",
        lvl === 2 && "brightness-125 contrast-150 grayscale filter",
        lvl === 3 && "brightness-110 contrast-125 saturate-150 sepia filter",
        lvl === 4 && "brightness-150 contrast-200 saturate-0 filter",
      )}
      alt={name}
    />
  );

  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl p-4 text-left transition-all duration-200",
        getColorClasses(lvl),
      )}
    >
      {/* Badge Icon */}
      <div className="flex justify-center">{getBadgeIcon()}</div>

      {/* Badge Name */}
      {/* <h4 className="text-center text-sm leading-tight font-bold">{name}</h4> */}

      {/* Level Progress */}
      {/* <div className="mb-2 text-center">
        {isEarned ? (
          <span className="text-xs font-medium opacity-90">
            {maxLvl ? `${lvl}/${maxLvl}` : `Poziom ${lvl || 0}`}
          </span>
        ) : (
          <span className="text-xs font-medium opacity-75">🔒 Zablokowana</span>
        )}
      </div> */}

      {/* Small progress bar */}
      {/* {nextLevelData && (
        <div className="">
          <div className="h-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )} */}
    </button>
  );
}

/* ----------------------------------------------------------
----------------------------------------------------------
----------------------------------------------------------
----------------------------------------------------------
----------------------------------------------------------
*/

// Modal szczegółów odznaki
export function BadgeModal({
  id,
  name,
  badgeImage,
  category,
  currentLevel,
  currentLevelData,
  nextLevel,
  nextLevelData,
  currentCount,
  isEarned,
  progress,
  progressText,
  template,
  isOpen,
  onClose,
}) {
  if (!isOpen || !id) return null;

  const description = isEarned
    ? currentLevelData?.description
    : nextLevelData?.description;

  const lvl = currentLevel;

  const getBadgeImage = (badgeImage) => {
    return (
      <img
        src={`/badges/${badgeImage}`}
        className={clsx(
          "h-32 w-32 rounded-2xl object-cover",
          lvl === 0 && "grayscale filter",
          lvl === 1 && "brightness-100 contrast-110 saturate-150 sepia filter",
          lvl === 2 && "brightness-125 contrast-150 grayscale filter",
          lvl === 3 && "brightness-110 contrast-125 saturate-150 sepia filter",
          lvl === 4 &&
            "brightness-110 contrast-125 hue-rotate-180 saturate-150 filter",
        )}
        alt={name}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-gray-800">
        {/* Header z kolorem odznaki */}
        <div
          className={clsx("p-4 text-center text-white", getColorClasses(lvl))}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 flex justify-center">
            {getBadgeImage(badgeImage)}
          </div>

          <h2 className="text-2xl font-bold">{name}</h2>

          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>

        {/* Szczegóły */}
        <div className="p-4">
          {/* Status i poziom */}
          <div className="mb-4 text-center">
            {isEarned ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900 dark:text-green-200">
                <span>✅</span>
                <span className="font-medium">Zdobyta - Poziom {lvl || 0}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                <span>🔒</span>
                <span className="font-medium">Niezdobyta</span>
              </div>
            )}
          </div>

          {/* Postęp do następnego poziomu */}
          {nextLevelData && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>
                  {isEarned
                    ? "Postęp do następnego poziomu"
                    : "Postęp do zdobycia"}
                </span>
                <span className="text-green-600 dark:text-green-400">
                  {progressText}
                </span>
              </div>

              <div className="relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Maksymalny poziom */}
          {isEarned && !nextLevelData && (
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 font-bold text-yellow-400">
                <span>Zdobyto maksymalny poziom!</span>
                <span>Ilość: {currentCount}</span>
              </div>
            </div>
          )}

          {/* Przycisk zamknięcia */}
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-blue-500 py-3 font-medium text-white transition-colors hover:bg-blue-600"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
