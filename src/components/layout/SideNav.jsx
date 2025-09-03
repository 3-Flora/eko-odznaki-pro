/* eslint-disable no-unused-vars */
import {
  Home,
  Plus,
  Trophy,
  User,
  BookOpen,
  CheckSquare,
  BarChart3,
  LogOut,
  Building,
  Users,
  FileText,
  Award,
  Settings,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { NavLink } from "react-router";
import { hapticFeedback } from "../../utils/hapticUtils";
import clsx from "clsx";

export const SideNav = () => {
  const { currentUser } = useAuth();
  const { logout } = useAuth();

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

  const ekoskopTabs = [
    {
      id: "/ekoskop/schools",
      icon: Building,
      label: "Szkoły",
    },
    {
      id: "/ekoskop/users",
      icon: Users,
      label: "Użytkownicy",
    },
    {
      id: "/ekoskop/statistics",
      icon: BarChart3,
      label: "Statystyki",
    },
    {
      id: "/ekoskop/articles",
      icon: FileText,
      label: "Artykuły",
    },
    {
      id: "/ekoskop/eco-actions",
      icon: Plus,
      label: "EkoDziałania",
    },
    {
      id: "/ekoskop/badges",
      icon: Award,
      label: "Odznaki",
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

  if (currentUser?.role === "teacher") {
    tabs.push(...teacherTabs);
  } else if (currentUser?.role === "ekoskop") {
    tabs.push(...ekoskopTabs);
  } else {
    tabs.push(...studentTabs);
  }

  tabs.push({ id: "/profile", icon: User, label: "Profil" });

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-green-600 dark:text-green-400">
            Eko Odznaki
          </h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {tabs.map(({ id, icon: Icon, label }) => (
                  <li key={id}>
                    <NavLink
                      to={id}
                      onClick={hapticFeedback}
                      className={({ isActive }) =>
                        clsx(
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200",
                          isActive
                            ? "bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : "text-gray-700 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-green-900 dark:hover:text-green-400",
                        )
                      }
                      end={id === "/"}
                    >
                      <Icon className="h-6 w-6 shrink-0" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
        <div className="-mx-2">
          {/* Logout button */}
          <button
            onClick={() => {
              (async () => {
                await logout();
              })();
            }}
            className="group flex w-full cursor-pointer gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 transition-all duration-200 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-green-900 dark:hover:text-green-400"
          >
            <LogOut className="h-6 w-6 shrink-0" />
            Wyloguj
          </button>
        </div>
      </div>
    </div>
  );
};
