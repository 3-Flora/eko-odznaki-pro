import { Trophy } from "lucide-react";
import { useNavigate } from "react-router";

export default function BadgesButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/profile/badges")}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 transition-colors hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800"
      title="Zobacz odznaki"
    >
      <Trophy className="h-4 w-4" />
    </button>
  );
}
