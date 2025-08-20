import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <ArrowLeft className="h-5 w-5 dark:text-white" />
    </button>
  );
}
