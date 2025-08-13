/* eslint-disable no-unused-vars */
import { Home, Plus, Trophy, User, BookOpen, CheckSquare } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { NavLink } from "react-router";
import { useDeviceEnvironment } from "../../contexts/DeviceEnvironmentContext";
import clsx from "clsx";

export const BottomNav = () => {
  const { currentUser } = useAuth();
  const { isPWA } = useDeviceEnvironment();

  const tabs = [
    { id: "/", icon: Home, label: "Główna" },
    {
      id: "/submit",
      icon: currentUser?.role === "teacher" ? CheckSquare : Plus,
      label: currentUser?.role === "teacher" ? "Sprawdź" : "Dodaj",
    },
    { id: "/ranking", icon: Trophy, label: "Ranking" },
    { id: "/challenges", icon: BookOpen, label: "Wyzwania" },
    { id: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <div
      className={clsx(
        "z-10 border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900",
        {
          "pb-6": isPWA,
        },
      )}
    >
      <div className="flex justify-around">
        {tabs.map(({ id, icon: Icon, label }) => (
          <NavLink
            key={id}
            to={id}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center rounded-lg px-3 py-2 transition-all duration-200 ` +
              (isActive
                ? "scale-105 bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300"
                : "text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400")
            }
            end={id === "/"}
          >
            <Icon className="mb-1 h-6 w-6" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
