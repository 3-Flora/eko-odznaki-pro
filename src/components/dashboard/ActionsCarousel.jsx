import { useNavigate } from "react-router";
import { motion } from "framer-motion";

function ActionsCarousel({ data }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Szybkie Działania
        </h3>
        <button
          onClick={() => navigate("/submit")}
          className="text-sm text-gray-500 dark:text-gray-300"
        >
          Zobacz wszystkie
        </button>
      </div>

      <div className="flex space-x-3 overflow-x-auto pb-2">
        {data.actions.map((action) => (
          <div
            key={action.id}
            className="min-w-[160px] flex-none rounded-xl border bg-white p-3 text-left dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-2 flex justify-center">
              <div className="flex flex-col">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white dark:bg-green-600">
                  {/* icon */}
                  <span className="text-4xl">{action.icon}</span>
                </div>
                <div className="text-xl font-medium text-gray-800 dark:text-white">
                  {action.name}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <button
                // tutaj przekierowywujne na /submit z wybranym EkoDziałaniem
                onClick={() => console.log("quick action", action)}
                className="w-full rounded-md bg-green-500 px-3 py-1 text-sm font-semibold text-white hover:bg-green-600"
              >
                Wykonaj
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
      <div className="mb-3 h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex space-x-3">
        <div className="h-24 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-24 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-24 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

ActionsCarousel.Skeleton = Skeleton;

export default ActionsCarousel;
