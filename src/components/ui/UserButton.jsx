import { User } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export default function UserButton() {
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  return (
    <div
      className="flex cursor-pointer items-center space-x-2"
      onClick={() => navigate("profile")}
    >
      {currentUser?.photoURL ? (
        <img
          src={currentUser.photoURL}
          alt={currentUser.displayName}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 dark:bg-green-700">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
