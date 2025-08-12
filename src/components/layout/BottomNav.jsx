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
      className={clsx("z-10 px-4 py-2 bg-white border-t border-gray-200", {
        "pb-6": isPWA,
      })}
    >
      <div className="flex justify-around">
        {tabs.map(({ id, icon: Icon, label }) => (
          <NavLink
            key={id}
            to={id}
            className={({ isActive }) =>
              `flex flex-col flex-1 items-center py-2 px-3 rounded-lg transition-all duration-200 ` +
              (isActive
                ? "text-green-600 bg-green-50 scale-105"
                : "text-gray-600 hover:text-green-600")
            }
            end={id === "/"}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
