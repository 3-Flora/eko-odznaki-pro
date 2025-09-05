import { BellPlus } from "lucide-react";
import { useNavigate } from "react-router";

export default function CreateNotificationButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/create-notification")}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-200 transition-colors dark:bg-gray-800"
    >
      <BellPlus className="text-gray-600 dark:text-gray-400" />
    </button>
  );
}
