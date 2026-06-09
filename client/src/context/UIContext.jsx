import { createContext, useContext, useState, useEffect } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("nexus-theme") || "dark";
  });

  const [font, setFont] = useState(() => {
    return localStorage.getItem("nexus-font") || "font-space";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("nexus-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("nexus-font", font);
  }, [font]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <UIContext.Provider
      value={{
        theme,
        toggleTheme,
        font,
        setFont,
        isSidebarOpen,
        toggleSidebar,
        setIsSidebarOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

// Custom Hook for clean consumption across UI layers
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};