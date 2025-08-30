import React from "react";
import { Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { APP_NAME } from "../api/constants";

const Navbar = ({ onOpenSettings }) => {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-bg/80 backdrop-blur-md">
			<div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
				{/* Left side: Logo */}
				<div className="flex items-center gap-2">
					<img src="/logo.svg" alt="IITM Mess Logo" className="h-8 w-8" />
					<span className="text-xl font-bold text-fg">{APP_NAME}</span>
				</div>

				{/* Right side: Icons */}
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<button
						onClick={onOpenSettings}
						className="p-2 rounded-full text-muted transition-colors hover:text-fg hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						aria-label="Open settings"
					>
						<Settings size={20} />
					</button>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
