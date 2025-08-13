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
        // Ignore error, theme already set from localStorage
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    Preferences.set({ key: THEME_KEY, value: theme });
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
