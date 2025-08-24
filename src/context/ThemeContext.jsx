import { createContext, useEffect, useState } from "react";

const ThemeContext = createContext();

/**
 * Determines the initial theme for the application.
 * It prioritizes the user's saved theme from localStorage,
 * falling back to the system's color scheme preference.
 * @returns {'dark' | 'light'} The initial theme.
 */
const getInitialTheme = () => {
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme) {
		return savedTheme;
	}
	const prefersDark =
		window.matchMedia &&
		window.matchMedia("(prefers-color-scheme: dark)").matches;
	return prefersDark ? "dark" : "light";
};

/**
 * Provides theme state ('dark' or 'light') and a toggle function to its children.
 * It persists the theme to localStorage and applies the 'dark' class to the document root.
 * @param {{ children: React.ReactNode }} props
 */
export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(getInitialTheme);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export default ThemeContext;
