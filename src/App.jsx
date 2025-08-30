import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useMemo, useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { Tooltip } from "react-tooltip";
import { ThemeProvider } from "./context/ThemeContext";

import { getContextForDate } from "./api/menuApi";
import {
	completeSetup,
	getPreferenceForCycle,
	isSetupComplete,
	setPreferenceForCycle,
	updateLastSeenCycle,
} from "./utils/weekManager";

import Footer from "./components/Footer";
import MenuExplorer from "./components/MenuExplorer";
import Navbar from "./components/Navbar";
import SettingsModal from "./components/SettingsModal";
import SetupModal from "./components/SetupModal";
import TodaysMenu from "./components/TodaysMenu";
import UpdatePrompt from "./components/UpdatePrompt";

function App() {


	const [modalToShow, setModalToShow] = useState(null); // 'initialSetup', 'newCyclePrompt', 'confirmNewCycle', 'settings'
	const [prefilledPreference, setPrefilledPreference] = useState(null);

	// This effect runs once on startup to determine if a modal should be shown.
	useMemo(() => {
		const setupDone = isSetupComplete();
		if (!setupDone) {
			setModalToShow("initialSetup");
			return;
		}

		const todayContext = getContextForDate(new Date());
		const lastSeenCycle = localStorage.getItem("lastSeenCycleName");
		const currentCycleName = todayContext?.cycleName;

		if (currentCycleName && currentCycleName !== lastSeenCycle) {
			const preferenceForNewCycle = getPreferenceForCycle(currentCycleName);

			if (preferenceForNewCycle) {
				// A preference exists for the new cycle, so show the confirmation prompt.
				setModalToShow("confirmNewCycle");
				setPrefilledPreference(preferenceForNewCycle);
			} else {
				// No preference exists, show the standard "new cycle" prompt.
				setModalToShow("newCyclePrompt");
			}
		}
	}, []);

	const handleOnboardingSave = (cycleName, category) => {
		// For initial setup, we also need to set the completion flag.
		if (modalToShow === "initialSetup") {
			completeSetup(cycleName, category);
		}

		// For all onboarding flows, we save the preference and update the "last seen" stamp.
		setPreferenceForCycle(cycleName, category);
		updateLastSeenCycle(cycleName);

		setModalToShow(null);
		window.location.reload();
	};

	const openSettingsModal = () => setModalToShow("settings");
	const closeAllModals = () => setModalToShow(null);

	const skeletonThemeLight = {
		baseColor: "#f9fafb",
		highlightColor: "#e5e7eb",
	};
	const skeletonThemeDark = { baseColor: "#1f2937", highlightColor: "#374151" };

	return (
		<ThemeProvider>
			<SkeletonTheme
				{...(document.documentElement.classList.contains("dark")
					? skeletonThemeDark
					: skeletonThemeLight)}
			>
				{(modalToShow === "initialSetup" ||
					modalToShow === "newCyclePrompt" ||
					modalToShow === "confirmNewCycle") && (
					<SetupModal
						onSave={handleOnboardingSave}
						context={modalToShow}
						prefilledPreference={prefilledPreference}
					/>
				)}

				{modalToShow === "settings" && (
					<SettingsModal isOpen={true} onClose={closeAllModals} />
				)}

				<div className="min-h-screen bg-bg font-sans text-fg transition-colors">
					<Navbar onOpenSettings={openSettingsModal} />
					<main>
						{isSetupComplete() ? (
							<>
								<TodaysMenu onOpenSettings={openSettingsModal} />
								<div className="w-full max-w-7xl mx-auto px-4">
									<div className="border-t border-border my-4 sm:my-10"></div>
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
				<UpdatePrompt />
				<Analytics />
				<SpeedInsights />
			</SkeletonTheme>
		</ThemeProvider>
	);
}

export default App;
