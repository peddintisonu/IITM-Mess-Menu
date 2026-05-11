import React, { useMemo } from "react";
import { Info, X, Flame } from "lucide-react";
import nutritionData from "../database/nutritionMenu.json";

/**
 * A modal to display nutritional information for a selected menu item.
 */
const NutritionModal = ({ isOpen, onClose, itemName }) => {
	// Robust, case-insensitive search for the item
	const nutritionalInfo = useMemo(() => {
		if (!itemName) return null;
		
		const searchName = itemName.toLowerCase().trim();
		const items = nutritionData.items || {};
		
		// Find exact or partial match
		const matchedKey = Object.keys(items).find(key => {
			const keyLower = key.toLowerCase();
			return keyLower === searchName || searchName.includes(keyLower) || keyLower.includes(searchName);
		});

		return matchedKey ? items[matchedKey] : null;
	}, [itemName]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
			<div className="bg-bg border border-border rounded-xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[80vh]">
				{/* Header */}
				<div className="p-6 border-b border-border flex-shrink-0">
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-muted hover:text-fg transition-colors"
						aria-label="Close"
					>
						<X size={24} />
					</button>
					<h2 className="text-xl font-bold text-fg m-0 flex items-center gap-2 pr-8">
						<Info className="text-primary" size={24} />
						{itemName}
					</h2>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto space-y-6">
					{nutritionalInfo ? (
						<div className="space-y-6">
							{Object.entries(nutritionalInfo).map(([measure, nutrients], idx) => (
								<div key={idx} className="bg-input-bg rounded-lg p-4 border border-border">
									<h3 className="text-md font-semibold text-primary mt-0 mb-3 flex items-center gap-1.5">
										<Flame size={16} />
										{measure}
									</h3>
									<div className="grid grid-cols-2 gap-4">
										{Object.entries(nutrients).map(([nutrient, value], nIdx) => (
											<div key={nIdx} className="flex flex-col">
												<span className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">
													{nutrient}
												</span>
												<span className="text-fg font-medium">{value}</span>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-6 text-muted">
							<Info className="mx-auto mb-2 opacity-50" size={32} />
							<p>No nutritional data available for this item yet.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default NutritionModal;
