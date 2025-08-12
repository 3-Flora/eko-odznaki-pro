import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { User, Trophy } from "lucide-react";

export const Navbar = () => {
  const { currentUser } = useAuth();

  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white border-b-4 border-green-400 shadow-lg">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="mr-3 text-2xl">🌱</div>
            <h1 className="text-xl font-bold text-gray-800 select-none">
              EKO-odznaki
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center px-3 py-1 bg-green-100 rounded-full">
              <Trophy className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                {currentUser?.points || 0} pkt
              </span>
            </div>

            <div
              className="flex items-center space-x-2"
              onClick={() => navigate("profile")}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
