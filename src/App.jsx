import { useState } from "react";
import { Tooltip } from "react-tooltip";
import Footer from "./components/Footer";
import MenuExplorer from "./components/MenuExplorer";
import Navbar from "./components/Navbar";
import SetupModal from "./components/SetupModal";
import TodaysMenu from "./components/TodaysMenu";
import UpdatePrompt from "./components/UpdatePrompt";
import { ThemeProvider } from "./context/ThemeContext";
import {
	completeSetup,
	isSetupComplete,
	setUserCategory,
} from "./utils/weekManager";

function App() {
	const [isSetupDoneState, setIsSetupDoneState] = useState(() =>
		isSetupComplete()
	);
	const [isModalOpen, setIsModalOpen] = useState(() => !isSetupComplete());

	const handleSave = (category) => {
		// The modal is only for initial setup if setup is not done yet.
		if (!isSetupDoneState) {
			completeSetup(category);
		} else {
			setUserCategory(category);
		}

		setIsSetupDoneState(true);
		setIsModalOpen(false);

		// Reload to apply changes consistently across the app
		window.location.reload();
	};

	const openSettingsModal = () => setIsModalOpen(true);
	const closeSettingsModal = () => setIsModalOpen(false);

	return (
		<ThemeProvider>
			{isModalOpen && (
				<SetupModal
					onComplete={handleSave}
					onClose={closeSettingsModal}
					isInitialSetup={!isSetupDoneState}
				/>
			)}

			<div className="min-h-screen bg-bg font-sans text-fg transition-colors">
				<Navbar onOpenSettings={openSettingsModal} />
				<main>
					{isSetupDoneState ? (
						<>
							<TodaysMenu />
							<div className="w-full max-w-7xl mx-auto px-4">
								<div className="border-t border-border my-6 sm:my-8"></div>
							</div>
							<MenuExplorer />
						</>
					) : (
						<div className="text-center py-20 text-muted">
							<p>Please select your mess to view the menu.</p>
						</div>
					)}
				</main>
				<Footer />
			</div>

			<Tooltip id="navbar-tooltip" className="tooltip-style" />
			<UpdatePrompt />
		</ThemeProvider>
	);
}

export default App;
