import clsx from "clsx";
import getColorClasses from "../../utils/getColorClasses";
import { useState } from "react";
import { Lock, X } from "lucide-react";
import Button from "../ui/Button";

export default function BadgeModal(props) {
  // Accept either an object `badge` or individual props (backwards-compatible)
  const { badge, isOpen, onClose } = props;

  const id = badge?.id ?? props.id;
  const name = badge?.name ?? props.name;
  const badgeImage = badge?.badgeImage ?? props.badgeImage;
  const category = badge?.category ?? props.category;
  const currentLevel = badge?.currentLevel ?? props.currentLevel;
  const currentLevelData = badge?.currentLevelData ?? props.currentLevelData;
  const nextLevel = badge?.nextLevel ?? props.nextLevel;
  const nextLevelData = badge?.nextLevelData ?? props.nextLevelData;
  const currentCount = badge?.currentCount ?? props.currentCount;
  const isEarned = badge?.isEarned ?? props.isEarned;
  const progress = badge?.progress ?? props.progress;
  const progressText = badge?.progressText ?? props.progressText;
  const template = badge?.template ?? props.template;

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
          <Button onClick={onClose} style="lightBlue">
            Zamknij
          </Button>
        </div>
      </div>
    </div>
  );
}
