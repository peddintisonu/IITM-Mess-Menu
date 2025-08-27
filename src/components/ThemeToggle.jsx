import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();
	const tooltipContent = `Switch to ${
		theme === "light" ? "Dark" : "Light"
	} Mode`;

	return (
		<button
			onClick={toggleTheme}
			className="p-2 rounded-full text-muted transition-colors hover:text-fg hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			aria-label={tooltipContent}
			data-tooltip-id="navbar-tooltip"
			data-tooltip-content={tooltipContent}
		>
			{theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
		</button>
	);
};

export default ThemeToggle;
