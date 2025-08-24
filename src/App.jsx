import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import {
	isSetupComplete as isSetupDone,
	completeSetup,
} from "./utils/weekManager";
import { Tooltip } from "react-tooltip";

// Import all components
import Navbar from "./components/Navbar";
import TodaysMenu from "./components/TodaysMenu";
import MenuExplorer from "./components/MenuExplorer";
import Footer from "./components/Footer";
import SetupModal from "./components/SetupModal";

function App() {
	const [isSetupComplete, setIsSetupComplete] = useState(() => isSetupDone());
	// A single state to control modal visibility for both setup and settings
	const [isModalOpen, setIsModalOpen] = useState(() => !isSetupDone());

	const handleSetupComplete = (week, category) => {
		completeSetup(week, category);
		setIsSetupComplete(true);
		setIsModalOpen(false);
		// Reload to ensure all components use the new global settings
		window.location.reload();
	};

	const openSettingsModal = () => setIsModalOpen(true);
	const closeSettingsModal = () => setIsModalOpen(false);

	return (
		<ThemeProvider>
			{isModalOpen && (
				<SetupModal
					onComplete={handleSetupComplete}
					onClose={closeSettingsModal}
					isInitialSetup={!isSetupComplete}
				/>
			)}

			<div className="min-h-screen bg-bg font-sans text-fg transition-colors">
				<Navbar onOpenSettings={openSettingsModal} />
				<main>
					{isSetupComplete ? (
						<>
							<TodaysMenu />
							<div className="w-full max-w-7xl mx-auto px-4">
								<div className="border-t border-border my-8"></div>
							</div>
							<MenuExplorer />
						</>
					) : (
						<div className="text-center py-20 text-muted">
							<p>Please complete the initial setup to view the menu.</p>
						</div>
					)}
				</main>
				<Footer />
			</div>
			<Tooltip id="navbar-tooltip" className="tooltip-style" />
		</ThemeProvider>
	);
}

export default App;
