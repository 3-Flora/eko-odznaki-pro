import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";
import clsx from "clsx";

export default function PendingVerificationCard({ data }) {
  const navigate = useNavigate();

  if (!data) return <PendingVerificationCard.Skeleton />;

  const { pendingSubmissions, pendingStudents } = data;

  const handleNavigateToSubmissions = () => {
    navigate("/teacher/submissions");
  };

  const handleNavigateToStudents = () => {
    navigate("/teacher/students");
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Oczekują weryfikacji
        </h3>
      </div>

      <div className="space-y-3">
        {/* EkoDziałania do weryfikacji */}
        <div
          onClick={
            pendingSubmissions > 0 ? handleNavigateToSubmissions : undefined
          }
          className={clsx(
            "cursor-pointer rounded-xl p-4 transition-all duration-200",
            pendingSubmissions > 0
              ? "bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
              : "bg-gray-50 dark:bg-gray-700",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "rounded-lg p-2",
                  pendingSubmissions > 0
                    ? "bg-orange-500 text-white"
                    : "bg-gray-400 text-white",
                )}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">
                  EkoDziałania
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Do sprawdzenia
                </div>
              </div>
            </div>
            <div
              className={clsx(
                "rounded-full px-3 py-1 text-lg font-bold",
                pendingSubmissions > 0
                  ? "bg-orange-500 text-white"
                  : "bg-gray-400 text-white",
              )}
            >
              {pendingSubmissions}
            </div>
          </div>
        </div>

        {/* Uczniowie do weryfikacji */}
        <div
          onClick={pendingStudents > 0 ? handleNavigateToStudents : undefined}
          className={clsx(
            "cursor-pointer rounded-xl p-4 transition-all duration-200",
            pendingStudents > 0
              ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              : "bg-gray-50 dark:bg-gray-700",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "rounded-lg p-2",
                  pendingStudents > 0
                    ? "bg-blue-500 text-white"
                    : "bg-gray-400 text-white",
                )}
              >
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">
                  Nowi uczniowie
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Do zatwierdzenia
                </div>
              </div>
            </div>
            <div
              className={clsx(
                "rounded-full px-3 py-1 text-lg font-bold",
                pendingStudents > 0
                  ? "bg-blue-500 text-white"
                  : "bg-gray-400 text-white",
              )}
            >
              {pendingStudents}
            </div>
          </div>
        </div>
      </div>

      {/* {pendingSubmissions === 0 && pendingStudents === 0 && (
        <div className="mt-4 text-center">
          <div className="text-4xl">✅</div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Wszystko na bieżąco!
          </p>
        </div>
      )} */}
    </div>
  );
}

PendingVerificationCard.Skeleton = function PendingVerificationCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
        <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
      </div>

      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600" />
                <div>
                  <div className="mb-1 h-5 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                </div>
              </div>
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
