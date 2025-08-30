import React, { useState } from "react";
import { getContextForDate } from "../api/menuApi";
import { APP_NAME, MENUS } from "../api/constants";
import SelectDropdown from "./SelectDropdown";

const SetupModal = ({ onSave, context, prefilledPreference }) => {
	const currentContext = getContextForDate(new Date());
	const currentCycleName = currentContext?.cycleName || "";
	const availableMenus = currentContext?.availableCategories || [];

	const [isChanging, setIsChanging] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState(() => {
		const initialValue = prefilledPreference || availableMenus[0]?.value || "";
		return initialValue;
	});

	const handleSave = () => {
		onSave(currentCycleName, selectedCategory);
	};

	const getFullCategoryLabel = (value) => {
		return MENUS.find((m) => m.value === value)?.label || value;
	};

	// UI for the confirmation prompt when a preference already exists for a new cycle
	if (context === "confirmNewCycle") {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
				<div className="bg-bg border border-border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative">
					<h2 className="text-2xl font-bold text-fg m-0 mb-2">
						Welcome to the New Cycle!
					</h2>

					{!isChanging ? (
						<>
							<p className="text-muted mb-6">
								The new "{currentCycleName}" cycle has begun. We see you've
								already set your preference to
								<strong className="text-primary mx-1">
									{getFullCategoryLabel(prefilledPreference)}
								</strong>
								. Is this correct?
							</p>
							<div className="flex justify-between gap-3 mt-6">
								<button
									onClick={() => setIsChanging(true)}
									className="btn-secondary"
								>
									Change
								</button>
								<button onClick={handleSave} className="btn-primary">
									Yes, Confirm
								</button>
							</div>
						</>
					) : (
						<>
							<p className="text-muted mb-6">
								Please select your new preference for the "{currentCycleName}"
								cycle.
							</p>
							<SelectDropdown
								label="Your Mess"
								id="setup-mess-change"
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								options={availableMenus}
							/>
							<div className="flex justify-between gap-3 mt-6">
								<button
									onClick={() => setIsChanging(false)}
									className="btn-secondary"
								>
									Cancel
								</button>
								<button onClick={handleSave} className="btn-primary">
									Save Change
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		);
	}

	// Standard UI for initial setup and new cycle prompts where no preference exists
	const content = {
		initialSetup: {
			title: `Welcome to ${APP_NAME}`,
			// --- THE FIX IS HERE ---
			description: `To get started, please select your mess for the current cycle: "${currentCycleName}".`,
			buttonText: "Save & Continue",
		},
		newCyclePrompt: {
			title: "Welcome to the New Cycle!",
			description: `The menu has been updated for the "${currentCycleName}" cycle. Please select your mess preference.`,
			buttonText: "Confirm & Save",
		},
	};

	const { title, description, buttonText } = content[context] || {};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
			<div className="bg-bg border border-border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative">
				<h2 className="text-2xl font-bold text-fg m-0 mb-2">{title}</h2>
				<p className="text-muted mb-6">{description}</p>
				<div className="space-y-4">
					{availableMenus.length > 0 ? (
						<SelectDropdown
							label="Your Mess"
							id="setup-mess"
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							options={availableMenus}
						/>
					) : (
						<p className="text-center text-muted border border-border rounded-lg p-4">
							Loading available messes...
						</p>
					)}
				</div>
				<button
					onClick={handleSave}
					disabled={!selectedCategory}
					className="btn-primary w-full mt-6"
				>
					{buttonText}
				</button>
			</div>
		</div>
	);
};

export default SetupModal;
