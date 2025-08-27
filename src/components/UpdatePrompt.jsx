import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * A toast-style component that appears at the top-center of the screen
 * to notify the user that a new version of the app is available.
 */
const UpdatePrompt = () => {
	// This hook from vite-plugin-pwa handles the PWA update logic.
	// We only need the 'needRefresh' state and the 'updateServiceWorker' function.
	const {
		needRefresh: [needRefresh],
		updateServiceWorker,
	} = useRegisterSW();

	// If no update is available, render nothing.
	if (!needRefresh) {
		return null;
	}

	return (
		// The main container for the toast, positioned at the top-center.
		<div
			className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
			role="alert"
		>
			{/* The toast itself with theme-aware styling and animation */}
			<div className="flex items-center justify-between gap-4 p-4 rounded-xl shadow-2xl bg-bg border border-border animate-fade-in-down">
				<div className="flex-grow">
					<p className="font-semibold text-fg">Update Available</p>
					<p className="text-sm text-muted mt-1">
						A new version of the app is ready. Reload to update.
					</p>
				</div>
				<button
					// The onClick handler triggers the service worker update and reloads the page.
					onClick={() => updateServiceWorker(true)}
					className="btn-primary flex-shrink-0"
				>
					Reload
				</button>
			</div>
		</div>
	);
};

export default UpdatePrompt;
