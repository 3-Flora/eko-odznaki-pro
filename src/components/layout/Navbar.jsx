import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { User, Trophy } from "lucide-react";
import { useDeviceEnvironment } from "../../contexts/DeviceEnvironmentContext";
import clsx from "clsx";
import ToggleTheme from "../ui/ToggleTheme";

export const Navbar = () => {
  const { currentUser } = useAuth();
  const { mobileDeviceType } = useDeviceEnvironment();

  const navigate = useNavigate();

  return (
    <nav
      className={clsx(
        "z-10 border-b-4 border-green-400 bg-white shadow-lg dark:border-green-700 dark:bg-gray-900",
        {
          "pt-11": mobileDeviceType === "SEorAndroid",
          "pt-16": mobileDeviceType === "notch",
        },
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 text-2xl">🌱</div>
            <h1 className="text-xl font-bold text-gray-800 select-none dark:text-white">
              Eko odznaki
            </h1>
          </div>

          <div className="flex flex-row gap-4">
            <ToggleTheme />
            <div className="flex items-center space-x-4">
              <div
                className="flex items-center space-x-2"
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
