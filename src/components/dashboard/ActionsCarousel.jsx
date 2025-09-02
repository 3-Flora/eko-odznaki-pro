import { useNavigate } from "react-router";
import clsx from "clsx";
import { backgroundEcoAction as backgroundStyles } from "../../utils/styleUtils";

function ActionsCarousel({ data }) {
  const navigate = useNavigate();

  const handleActionSelect = (action) => {
    navigate("/submit/action", { state: { action } });
  };

  return (
    <div className="z-1 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
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
        {data.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionSelect(action)}
            className="flex aspect-square flex-col items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-2 flex flex-col items-center">
              <div
                className={clsx(
                  "mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl",
                  backgroundStyles[action.style?.color || "default"],
                )}
              >
                {action.style?.icon || "🌱"}
              </div>
              <div
                className={clsx(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  backgroundStyles[action.style?.color || "default"],
                )}
              >
                {action.category}
              </div>
            </div>

            <h3 className="leading-tight font-semibold text-gray-800 dark:text-white">
              {action.name}
            </h3>
          </button>
        ))}
      </div>
    </div>
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
