import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

const STORAGE_KEY = "nirikshan.theme";

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window === "undefined") return "light";
        return window.localStorage.getItem(STORAGE_KEY) || "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch (_) {
            /* ignore quota / privacy */
        }
    }, [theme]);

    const setTheme = (next) => setThemeState(next);
    const toggleTheme = () =>
        setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
