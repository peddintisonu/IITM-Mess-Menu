import React, { useState } from "react";
import { MENUS, WEEKS } from "../api/constants";
import { getCurrentWeek, getUserCategory } from "../utils/weekManager";
import SelectDropdown from "./SelectDropdown";
import { X } from "lucide-react";

/**
 * A modal for both initial setup and updating user preferences.
 * @param {{
 *   onComplete: (week: string, category: string) => void;
 *   onClose: () => void;
 *   isInitialSetup: boolean;
 * }} props
 */
const SetupModal = ({ onComplete, onClose, isInitialSetup }) => {
	// Initialize state with current settings if they exist, otherwise use defaults
	const [selectedWeek, setSelectedWeek] = useState(
		() => getCurrentWeek() || "A"
	);
	const [selectedCategory, setSelectedCategory] = useState(
		() => getUserCategory() || "South_Non_Veg"
	);

	const handleSave = () => {
		onComplete(selectedWeek, selectedCategory);
	};

	const title = isInitialSetup ? "Welcome!" : "Settings";
	const description = isInitialSetup
		? "Let's set up your preferences to get started. You can change these anytime in the settings."
		: "Update your current mess week and default mess category.";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
			<div className="bg-bg border border-border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative">
				{/* Close button (not shown on mandatory initial setup) */}
				{!isInitialSetup && (
					<button
						onClick={onClose}
						className="absolute top-3 right-3 text-muted hover:text-fg transition-colors"
					>
						<X size={24} />
					</button>
				)}

				<h2 className="text-2xl font-bold text-fg m-0 mb-2">{title}</h2>
				<p className="text-muted mb-6">{description}</p>

				<div className="space-y-4">
					<SelectDropdown
						label="Current Mess Week"
						id="setup-week"
						value={selectedWeek}
						onChange={(e) => setSelectedWeek(e.target.value)}
						options={WEEKS}
					/>
					<SelectDropdown
						label="Your Mess"
						id="setup-mess"
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						options={MENUS}
					/>
				</div>

				<button onClick={handleSave} className="btn-primary w-full mt-6">
					Save Changes
				</button>
			</div>
		</div>
	);
};

export default SetupModal;
