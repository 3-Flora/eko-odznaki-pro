import { useNavigate } from "react-router";

import { useDeviceEnvironment } from "../../contexts/DeviceEnvironmentContext";
import clsx from "clsx";
import ToggleTheme from "../ui/ToggleTheme";
import BadgesButton from "../ui/Badgesbutton";
import UserButton from "../ui/UserButton";
import DebugButton from "../debug/DebugButton";

export const Navbar = () => {
  const { mobileDeviceType } = useDeviceEnvironment();

  const navigate = useNavigate();

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-between">
          <div
            className="mr-3 text-2xl"
            onClick={() => {
              navigate("/");
            }}
          >
            <img src="/favicon-32x32.png" alt="" />
          </div>

          <div className="flex flex-row gap-4">
            <DebugButton />
            <BadgesButton />
            <ToggleTheme />
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
