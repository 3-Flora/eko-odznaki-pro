import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const expandSidebar = () => {
    setIsCollapsed(false);
  };

  const collapseSidebar = () => {
    setIsCollapsed(true);
  };

  // Dodaj obsługę skrótu klawiaturowego Ctrl/Cmd + B
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = {
    isCollapsed,
    toggleSidebar,
    expandSidebar,
    collapseSidebar,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
