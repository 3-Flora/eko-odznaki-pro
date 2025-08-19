import { motion } from "framer-motion";
import { Pickaxe } from "lucide-react";

function ProgressCard({ data }) {
  //   const badgePct = Math.round(
  //     (data.featuredBadge.progress.current / data.featuredBadge.progress.target) *
  //       100,
  //   );

  const badgePct = 50;

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
                {/* {data.rank.label}: {data.rank.position}/{data.rank.totalInClass} */}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Odznaka
              </div>
              <div className="font-semibold dark:text-white">
                {/* {data.featuredBadge.name} (Lv {data.featuredBadge.level}) */}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
              <span>
                {/* {data.featuredBadge.progress.current} /{" "}
                {data.featuredBadge.progress.target}{" "}
                {data.featuredBadge.progress.label} */}
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
          {/* {data.callToAction.text} */} CTA TEXT
        </button>
      </div>
    </motion.div>
  );
}

function Skeleton() {
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

ProgressCard.Skeleton = Skeleton;
export default ProgressCard;
