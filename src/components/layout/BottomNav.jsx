/* eslint-disable no-unused-vars */
import {
  Home,
  Plus,
  Trophy,
  User,
  BookOpen,
  CheckSquare,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { NavLink } from "react-router";
import { useDeviceEnvironment } from "../../contexts/DeviceEnvironmentContext";
import { hapticFeedback } from "../../utils/hapticUtils";
import clsx from "clsx";

export const BottomNav = () => {
  const { currentUser } = useAuth();
  const { mobileDeviceType } = useDeviceEnvironment();

  console.log(currentUser?.role === "teacher");

  const teacherTabs = [
    {
      id: "/teacher/submissions",
      icon: CheckSquare,
      label: "Sprawdź",
    },
    {
      id: "/teacher/students",
      icon: BookOpen,
      label: "Uczniowie",
    },
    {
      id: "/teacher/statistics",
      icon: BarChart3,
      label: "Statystyki",
    },
  ];

  const studentTabs = [
    {
      id: "/submit",
      icon: Plus,
      label: "Dodaj",
    },
  ];

  const tabs = [];

  tabs.push({ id: "/", icon: Home, label: "Główna" });
  tabs.push(...(currentUser?.role === "teacher" ? teacherTabs : studentTabs));
  tabs.push({ id: "/profile", icon: User, label: "Profil" });

  return (
    <div
      className={clsx(
        "z-10 flex justify-between border-t border-gray-200 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900",
        {
          "pb-6": mobileDeviceType === "Android",
          "pb-safe": mobileDeviceType === "iPhone",
        },
      )}
    >
      {tabs.map(({ id, icon: Icon, label }) => (
        <NavLink
          key={id}
          to={id}
          onClick={hapticFeedback}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center rounded-lg px-3 py-1 transition-all duration-200 ` +
            (isActive
              ? "bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300"
              : "text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400")
          }
          end={id === "/"}
        >
          <Icon className="mb-1 h-8 w-8" />
          {/* <span className="text-xs font-medium">{label}</span> */}
        </NavLink>
      ))}
    </div>
  );
};
