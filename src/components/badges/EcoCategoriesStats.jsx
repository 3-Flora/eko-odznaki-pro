import clsx from "clsx";
import { generateCategoryStats } from "../../constants/ecoCategories";

/**
 * Komponent wyświetlający statystyki kategorii EkoDziałań
 * @param {Object} userCounters - Liczniki użytkownika
 * @param {boolean} showGrid - Czy wyświetlać w formie siatki
 * @param {string} title - Tytuł sekcji
 */
export default function EcoCategoriesStats({
  userCounters = {},
  showGrid = true,
  title = "EkoDziałania wg kategorii",
}) {
  const categoryStats = generateCategoryStats(userCounters);

  if (showGrid) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {categoryStats.map((category) => (
            <div
              key={category.id}
              className={clsx("rounded-lg p-3", category.bgColor)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <div>
                  <p className={clsx("font-medium", category.color)}>
                    {category.count}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {category.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Lista pionowa
  return (
    <div className="space-y-3">
      {categoryStats.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className={clsx("rounded-full p-2", category.bgColor)}>
              <span className="text-lg">{category.icon}</span>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {category.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={clsx("text-xl font-bold", category.color)}>
              {category.count}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">działań</p>
          </div>
        </div>
      ))}
    </div>
  );
}
