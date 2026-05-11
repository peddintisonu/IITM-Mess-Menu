import React, { useState } from "react";
import { Circle, Info } from "lucide-react";
import { MEALS } from "../api/constants";
import MenuIcon from "./MenuIcon";
import MenuItem from "./MenuItem";
import NutritionModal from "./NutritionModal";
import nutritionData from "../database/nutritionMenu.json";



const MealCard = ({ title, items, commonItems, status }) => {
	const [selectedNutritionItem, setSelectedNutritionItem] = useState(null);
	const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);

	const handleInfoClick = (item) => {
		const itemName = typeof item === "object" && item !== null ? item.name : item;
		// Strip asterisks if it's a string
		const cleanName = typeof itemName === "string" ? itemName.replace(/\*/g, "") : itemName;
		setSelectedNutritionItem(cleanName);
		setIsNutritionModalOpen(true);
	};

	const mealInfo = MEALS.find((meal) => meal.value === title);
	const timing = mealInfo ? mealInfo.timing : null;

	const hasNutritionData = (item) => {
		const itemName = typeof item === "object" && item !== null ? item.name : item;
		const cleanName = typeof itemName === "string" ? itemName.replace(/\*/g, "") : itemName;
		if (!cleanName) return false;
		
		const searchName = cleanName.toLowerCase().trim();
		const itemsObj = nutritionData.items || {};
		return Object.keys(itemsObj).some(key => {
			const keyLower = key.toLowerCase();
			return keyLower === searchName || searchName.includes(keyLower) || keyLower.includes(searchName);
		});
	};

	const getContainerClasses = () => {
		const baseClasses =
			"border rounded-xl p-5 flex flex-col h-full shadow-sm transition-all duration-300";
		const bgClasses = "bg-white dark:bg-input-bg";

		switch (status) {
			case "active":
				return `${baseClasses} ${bgClasses} border-primary ring-2 ring-primary/20`;
			case "past":
			case "future":
			default:
				return `${baseClasses} ${bgClasses} border-border`;
		}
	};

	const contentOpacityClass = status === "past" ? "opacity-60" : "";

	if (!items || items.length === 0) {
		return (
			<div
				className={`${getContainerClasses()} items-center justify-center min-h-[200px]`}
			>
				<div className={contentOpacityClass}>
					<p className="text-muted">No {title} Today</p>
				</div>
			</div>
		);
	}

	return (
		// --- THE MAIN LAYOUT FIX IS HERE ---
		<div className={getContainerClasses()}>
			<div className={`flex flex-col h-full ${contentOpacityClass}`}>
				{/* --- Header Section (Fixed at the top) --- */}
				<div className="pb-4 border-b border-border/50">
					<div className="flex items-center gap-3">
						<MenuIcon meal={title} className="text-primary" />
						<div>
							<h3 className="text-xl font-semibold text-fg m-0">{title}</h3>
							{timing && <p className="text-xs text-muted m-0">{timing}</p>}
						</div>
					</div>
				</div>

				{/* --- Main Content Area (Grows to fill space) --- */}
				<ul className="flex-grow space-y-2 text-muted pt-4">
					{items.map((item, index) => (
						<li key={index} className="flex gap-2 items-start sm:items-center">
							<Circle
								className="text-primary flex-shrink-0 mt-1.5 sm:mt-0 sm:self-center"
								size={6}
								fill="currentColor"
							/>
							<div className="flex-grow flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
								<MenuItem item={item} />
								{hasNutritionData(item) && (
									<button 
										className="text-muted hover:text-primary transition-colors focus-reset rounded-full flex-shrink-0"
										onClick={() => handleInfoClick(item)}
										aria-label="Nutritional Info"
										title="Nutritional Info"
									>
										<Info size={14} />
									</button>
								)}
							</div>
						</li>
					))}
				</ul>

				{/* --- Common Items (Fixed at the bottom) --- */}
				{commonItems && (
					<div className="mt-4 pt-4 border-t border-border/50 flex-shrink-0">
						<p className="text-xs font-semibold text-muted uppercase tracking-wider">
							Common Items
						</p>
						<p className="text-sm text-muted/80 mt-1">{commonItems}</p>
					</div>
				)}
			</div>

			<NutritionModal 
				isOpen={isNutritionModalOpen} 
				onClose={() => setIsNutritionModalOpen(false)} 
				itemName={selectedNutritionItem} 
			/>
		</div>
	);
};

export default MealCard;
