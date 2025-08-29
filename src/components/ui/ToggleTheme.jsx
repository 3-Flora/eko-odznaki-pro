import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ToggleTheme() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors dark:bg-gray-800"
    >
      {theme === "dark" ? (
        <Sun className="text-white" />
      ) : (
        <Moon className="text-black" />
      )}
    </button>
  );
}
