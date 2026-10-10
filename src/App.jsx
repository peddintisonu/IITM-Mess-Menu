import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import AppRouter from "./router/AppRouter";

// Global Shared Components
import SettingsModal from "./features/mess-menu/components/SettingsModal";
import DonateModal from "./components/modals/DonateModal";
import FeedbackModal from "./components/modals/FeedbackModal";
import ConnectedAppsCarousel from "./components/navigation/ConnectedAppsCarousel";
import FloatingMenu from "./components/navigation/FloatingMenu";
import UpdatePrompt from "./components/ui/UpdatePrompt";
import { MigrationApp } from "./features/mess-menu/components/MigrationApp";

export default function App() {
	const [modalToShow, setModalToShow] = useState(null);

	// Feature Flags for Floating Menu
	const ENABLE_FLOATING_MENU = true;
	const SHOW_DONATE_BUTTON = false;
	const SHOW_FEEDBACK_BUTTON = true;
	const SHOW_CONNECTED_APPS = true;

	const openSettingsModal = () => setModalToShow("settings");
	const openDonateModal = () => setModalToShow("donate");
	const openFeedbackModal = () => setModalToShow("feedback");
	const openConnectedAppsModal = () => setModalToShow("connectedApps");
	const closeAllModals = () => setModalToShow(null);

	// --- The Domain Check ---
	const oldHostname = "iitm-mess-menu.vercel.app";

	// If the app is running on the old domain, render the special migration component.
	if (window.location.hostname === oldHostname) {
		return <MigrationApp />;
	}

	return (
		<ThemeProvider>
			{/* Global Modals */}
			{modalToShow === "settings" && <SettingsModal isOpen={true} onClose={closeAllModals} />}
			{modalToShow === "donate" && <DonateModal isOpen={true} onClose={closeAllModals} />}
			{modalToShow === "feedback" && <FeedbackModal isOpen={true} onClose={closeAllModals} />}
			<ConnectedAppsCarousel isOpen={modalToShow === "connectedApps"} onClose={closeAllModals} />

			{/* Router Views */}
			<AppRouter
				onOpenSettings={openSettingsModal}
				onOpenFeedback={openFeedbackModal}
			/>

			{/* Global Floating Action Bar */}
			<FloatingMenu
				onOpenDonate={openDonateModal}
				onOpenFeedback={openFeedbackModal}
				onOpenConnectedApps={openConnectedAppsModal}
				showMenu={ENABLE_FLOATING_MENU}
				showDonate={SHOW_DONATE_BUTTON}
				showFeedback={SHOW_FEEDBACK_BUTTON}
				showConnectedApps={SHOW_CONNECTED_APPS}
			/>

			<UpdatePrompt />
			<Analytics />
			<SpeedInsights />
		</ThemeProvider>
	);
}
