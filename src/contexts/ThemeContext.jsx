import { createContext, useState, useMemo, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

const THEME_KEY = "theme";

// Load theme from localStorage synchronously
const getInitialTheme = () => {
  const localValue = localStorage.getItem(THEME_KEY);
  if (localValue === "light" || localValue === "dark") {
    return localValue;
  }
  return "dark";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try to get from Capacitor Preferences
        const { value } = await Preferences.get({ key: THEME_KEY });
        if (value === "light" || value === "dark") {
          setTheme(value);
        }
      } catch (error) {
        console.log("Error loading theme from Preferences:", error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    Preferences.set({ key: THEME_KEY, value: theme });
    localStorage.setItem(THEME_KEY, theme);

    // Add theme class to body
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
