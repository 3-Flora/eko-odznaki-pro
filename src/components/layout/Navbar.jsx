import { useLocation } from "react-router";
import { useDeviceEnvironment } from "../../contexts/DeviceEnvironmentContext";
import clsx from "clsx";
import ToggleTheme from "../ui/ToggleTheme";
import BadgesButton from "./BadgesButton";
import UserButton from "../ui/UserButton";
import DebugButton from "../debug/DebugButton";
import BackButton from "../ui/BackButton";
import RefreshButton from "../ui/RefreshButton";
import { SimpleNotificationBell } from "../notifications";
import CreateNotificationButton from "../notifications/CreateNotificationButton";
import { useAuth } from "../../contexts/AuthContext";

export const Navbar = () => {
  const { mobileDeviceType } = useDeviceEnvironment();
  const { pathname } = useLocation();
  const { currentUser } = useAuth();

  // pokaż BackButton gdy jesteśmy na podstronie (ścieżka różna od "/", "/profile", "/submit")
  const excluded = new Set([
    // Everyone
    "/",
    "/profile",
    // Students
    "/submit",
    // Teachers
    "/teacher/submissions",
    "/teacher/students",
    "/teacher/statistics",
    // EkoSkop
    "/ekoskop",
    "/ekoskop/schools",
    "/ekoskop/users",
    "/ekoskop/statistics",
    // "/ekoskop/articles",
    "/ekoskop/eco-actions",
    "/ekoskop/badges",
  ]);
  const normalizedPath =
    (pathname || "/").split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const showBackButton = !excluded.has(normalizedPath);

  return (
    <nav
      className={clsx(
        "z-10 border-b-4 border-green-400 bg-white shadow-lg dark:border-green-700 dark:bg-gray-900",
        {
          "pt-5": mobileDeviceType === "Android",
          "pt-safe": mobileDeviceType === "iPhone",
        },
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-row items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {showBackButton && <BackButton />}
          {/* Logo/title visible on desktop when no back button */}
          {!showBackButton && (
            <object
              data="/logo.svg"
              type="image/svg+xml"
              className="h-8 w-8 text-green-600 dark:text-green-400"
            >
              Logo
            </object>
          )}
        </div>
        <div className="flex flex-row gap-2">
          {(currentUser.role === "teacher" ||
            currentUser.role === "ekoskop") && <CreateNotificationButton />}
          <SimpleNotificationBell />
          <RefreshButton className="hidden sm:flex" />
          <DebugButton />
          <ToggleTheme />
          <UserButton />
        </div>
      </div>
    </nav>
  );
};
