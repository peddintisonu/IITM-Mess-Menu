import React from "react";
import { Circle } from "lucide-react";
import { MEALS } from "../api/constants";
import MenuIcon from "./MenuIcon";

/**
 * A small component to render a single menu item,
 * correctly handling both string and object formats.
 */
const MenuItem = ({ item }) => {
	const isSpecialByObject =
		typeof item === "object" && item !== null && item.isSpecial;
	const isSpecialByString =
		typeof item === "string" && item.startsWith("*") && item.endsWith("*");
	const isSpecial = isSpecialByObject || isSpecialByString;

	let itemName = "";
	if (typeof item === "object" && item !== null) {
		itemName = item.name;
	} else if (isSpecialByString) {
		itemName = item.slice(1, -1);
	} else {
		itemName = item;
	}

	if (!itemName) return null;

	return (
		<span className={isSpecial ? "font-bold text-primary" : ""}>
			{itemName}
		</span>
	);
};

const MealCard = ({ title, items, commonItems, status }) => {
	const mealInfo = MEALS.find((meal) => meal.value === title);
	const timing = mealInfo ? mealInfo.timing : null;

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
						<li key={index} className="flex gap-2 items-center">
							<Circle
								className="text-primary flex-shrink-0 self-center"
								size={6}
								fill="currentColor"
							/>
							<div className="flex-grow">
								<MenuItem item={item} />
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
		</div>
	);
};

export default MealCard;
