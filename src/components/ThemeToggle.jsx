import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			onClick={toggleTheme}
			className="p-2 rounded-full text-muted transition-colors hover:text-fg hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			aria-label="Toggle Theme"
		>
			{theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
		</button>
	);
};

export default ThemeToggle;
