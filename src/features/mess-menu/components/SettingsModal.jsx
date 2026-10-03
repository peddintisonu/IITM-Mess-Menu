import React, { useState, useEffect, useCallback } from "react";
import { getNeighboringCycles, getContextForCycle } from "../api/menuApi";
import {
	clearAllUserData,
	getCyclePreferences,
	setCyclePreferences,
} from "../utils/weekManager";
import SelectDropdown from "./SelectDropdown";
import { ListChecks, ShieldCheck, Trash2, X } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

/**
 * A reusable UI component for managing the mess preference for a single cycle.
 * It now includes a visual highlight if it's the current cycle.
 */
const CyclePreference = ({
	cycle,
	initialPreference,
	onPreferenceChange,
	isCurrent,
}) => {
	const context = getContextForCycle(cycle);
	const availableMenus = context?.availableCategories || [];

	const [selectedCategory, setSelectedCategory] = useState(() => {
		const isValid = availableMenus.some(
			(menu) => menu.value === initialPreference
		);
		return isValid ? initialPreference : availableMenus[0]?.value || "";
	});

	useEffect(() => {
		onPreferenceChange(cycle.name, selectedCategory);
	}, [selectedCategory, cycle.name, onPreferenceChange]);

	// Conditionally add a highlight class if this is the current cycle
	const containerClasses = `p-4 border rounded-lg bg-input-bg transition-all ${
		isCurrent ? "border-primary shadow-lg" : "border-border"
	}`;

	return (
		<div className={containerClasses}>
			<div className="flex justify-between items-center mb-2">
				<p className="font-semibold text-fg">{cycle.name}</p>
				{isCurrent && (
					<span className="badge badge-primary text-xs">Current</span>
				)}
			</div>
			<SelectDropdown
				label="Your Mess for this Cycle"
				id={`settings-mess-${cycle.startDate}`}
				value={selectedCategory}
				onChange={(e) => setSelectedCategory(e.target.value)}
				options={availableMenus}
			/>
		</div>
	);
};

/**
 * A modal for managing all user settings, with a fixed height and scrollable content.
 */
const SettingsModal = ({ isOpen, onClose }) => {
	const [neighboringCycles, setNeighboringCycles] = useState({
		previous: null,
		current: null,
		next: null,
	});
	const [preferences, setPreferences] = useState(() => getCyclePreferences());
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setNeighboringCycles(getNeighboringCycles());
			setPreferences(getCyclePreferences());
		}
	}, [isOpen]);

	const handlePreferenceChange = useCallback((cycleName, category) => {
		setPreferences((prev) => ({
			...prev,
			[cycleName]: category,
		}));
	}, []);

	const handleSave = () => {
		setCyclePreferences(preferences);
		onClose();
		window.location.reload();
	};

	const handleDeleteConfirm = () => {
		clearAllUserData();
	};

	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
				<div className="bg-bg border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 relative flex flex-col h-[70dvh]">
					<div className="p-6 border-b border-border flex-shrink-0">
						<button
							onClick={onClose}
							className="absolute top-3 right-3 text-muted hover:text-fg transition-colors"
						>
							<X size={24} />
						</button>
						<h2 className="text-2xl font-bold text-fg m-0">Settings</h2>
					</div>

					<div className="flex-grow overflow-y-auto p-6 space-y-6">
						<div className="space-y-4">
							<h3 className="text-md font-semibold text-fg flex items-center gap-2">
								<ListChecks size={18} />
								Mess Preferences
							</h3>
							{neighboringCycles.previous && (
								<CyclePreference
									cycle={neighboringCycles.previous}
									initialPreference={
										preferences[neighboringCycles.previous.name]
									}
									onPreferenceChange={handlePreferenceChange}
									isCurrent={false}
								/>
							)}
							{neighboringCycles.current && (
								<CyclePreference
									cycle={neighboringCycles.current}
									initialPreference={
										preferences[neighboringCycles.current.name]
									}
									onPreferenceChange={handlePreferenceChange}
									isCurrent={true} // Mark the current cycle
								/>
							)}
							{neighboringCycles.next && (
								<CyclePreference
									cycle={neighboringCycles.next}
									initialPreference={preferences[neighboringCycles.next.name]}
									onPreferenceChange={handlePreferenceChange}
									isCurrent={false}
								/>
							)}
						</div>

						{/* Separator between sections */}
						<div className="border-b border-border/50"></div>

						<div className="space-y-2">
							<h3 className="text-md font-semibold text-fg flex items-center gap-2">
								<ShieldCheck size={18} />
								Privacy & Data
							</h3>
							<p className="text-sm text-muted">
								All your preferences are stored locally in your browser and are
								never sent to any server. Your privacy is respected.
							</p>
							<button
								onClick={() => setIsConfirmOpen(true)}
								className="btn-secondary text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-500/50 flex items-center gap-2"
							>
								<Trash2 size={16} />
								Delete All My Data
							</button>
						</div>
					</div>

					<div className="p-6 border-t border-border flex-shrink-0">
						<button onClick={handleSave} className="btn-primary w-full">
							Save Changes
						</button>
					</div>
				</div>
			</div>

			<ConfirmationModal
				isOpen={isConfirmOpen}
				onClose={() => setIsConfirmOpen(false)}
				onConfirm={handleDeleteConfirm}
				title="Delete All Data?"
				description="Are you sure you want to delete all your saved preferences? This action cannot be undone and will reset the app."
			/>
		</>
	);
};

export default SettingsModal;
