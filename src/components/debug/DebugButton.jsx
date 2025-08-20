import { TestTubeDiagonalIcon } from "lucide-react";
import { useNavigate } from "react-router";

export default function DebugButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/profile/debug")}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 transition-colors hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800"
      title="debug"
    >
      <TestTubeDiagonalIcon className="h-4 w-4" />
    </button>
  );
}
