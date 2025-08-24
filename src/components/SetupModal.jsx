import React, { useState, useEffect } from "react";
import { getAvailableCategoriesForCurrentVersion } from "../api/menuApi";
import { getUserCategory } from "../utils/weekManager";
import SelectDropdown from "./SelectDropdown";
import { X } from "lucide-react";

/**
 * A modal for setting and updating the user's preferred mess category.
 * @param {{
 *   onComplete: (category: string) => void;
 *   onClose: () => void;
 *   isInitialSetup: boolean;
 * }} props
 */
const SetupModal = ({ onComplete, onClose, isInitialSetup }) => {
	const [availableMenus, setAvailableMenus] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(
		() => getUserCategory() || "South_Non_Veg"
	);

	useEffect(() => {
		const menus = getAvailableCategoriesForCurrentVersion();
		setAvailableMenus(menus);

		const isSavedCategoryStillAvailable = menus.some(
			(menu) => menu.value === selectedCategory
		);
		if (!isSavedCategoryStillAvailable && menus.length > 0) {
			setSelectedCategory(menus[0].value);
		}
	}, [selectedCategory]);

	const handleSave = () => {
		onComplete(selectedCategory);
	};

	const title = isInitialSetup ? "Welcome!" : "Settings";
	const description = isInitialSetup
		? "Please select your mess to get started. You can change this anytime in the settings."
		: "Update your default mess category.";
	const buttonText = isInitialSetup ? "Save & Continue" : "Save Changes";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
			<div className="bg-bg border border-border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative">
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
					disabled={availableMenus.length === 0}
					className="btn-primary w-full mt-6"
				>
					{buttonText}
				</button>
			</div>
		</div>
	);
};

export default SetupModal;
