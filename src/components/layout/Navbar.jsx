import { useLocation } from "react-router";
import { useDeviceEnvironment } from "../../contexts/DeviceEnvironmentContext";
import clsx from "clsx";
import ToggleTheme from "../ui/ToggleTheme";
import BadgesButton from "../ui/Badgesbutton";
import UserButton from "../ui/UserButton";
import DebugButton from "../debug/DebugButton";
import BackButton from "../ui/BackButton";

export const Navbar = () => {
  const { mobileDeviceType } = useDeviceEnvironment();
  const { pathname } = useLocation();

  // pokaż BackButton gdy jesteśmy na podstronie (ścieżka różna od "/", "/profile", "/submit")
  const showBackButton =
    pathname !== "/" && pathname !== "/profile" && pathname !== "/submit";

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
      <div className="flex max-w-7xl flex-row items-center justify-center px-4 py-2 sm:px-6 lg:px-8">
        <div className="">{showBackButton && <BackButton />}</div>
        <div className="ml-auto flex flex-row gap-2">
          <DebugButton />
          <BadgesButton />
          <ToggleTheme />
          <UserButton />
        </div>
      </div>
    </nav>
  );
};
