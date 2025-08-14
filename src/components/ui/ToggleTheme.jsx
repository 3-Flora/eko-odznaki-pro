import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ToggleTheme() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme}>
      {theme === "dark" ? (
        <Sun className="text-white" />
      ) : (
        <Moon className="text-black" />
      )}
    </button>
  );
}
