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
        "group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95",
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
