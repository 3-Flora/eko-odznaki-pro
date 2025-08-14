import clsx from "clsx";

export default function UserTypeSelect({ onRoleChange, role }) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        className={clsx(
          "text flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 font-semibold transition",
          role === "student"
            ? "border-green-500 bg-green-500 text-white shadow-lg"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-800",
        )}
        onClick={() => onRoleChange("student")}
      >
        <span>🧑‍🎓 Uczeń</span>
      </button>
      <button
        type="button"
        className={clsx(
          "text flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 font-semibold transition",
          role === "teacher"
            ? "border-emerald-600 bg-emerald-600 text-white shadow-lg"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-800",
        )}
        onClick={() => onRoleChange("teacher")}
      >
        <span>👨‍🏫 Nauczyciel</span>
      </button>
    </div>
  );
}
