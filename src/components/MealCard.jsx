import { Circle } from "lucide-react"; // 1. Import a proper icon for the bullet point
import { MEALS } from "../api/constants";
import MenuIcon from "./MenuIcon";

/**
 * A small component to render a single menu item,
 * with special styling for items marked with asterisks.
 * @param {{ item: string }} props
 */
const MenuItem = ({ item }) => {
	const isSpecial = item.startsWith("*") && item.endsWith("*");

	if (isSpecial) {
		const specialItem = item.slice(1, -1);
		return <span className="font-bold text-primary">{specialItem}</span>;
	}

	return <span>{item}</span>;
};

const MealCard = ({ title, items, commonItems }) => {
	const mealInfo = MEALS.find((meal) => meal.value === title);
	const timing = mealInfo ? mealInfo.timing : null;

	if (!items || items.length === 0) {
		return (
			<div className="bg-input-bg border border-border rounded-xl p-5 flex flex-col h-full shadow-sm items-center justify-center min-h-[200px]">
				<p className="text-muted">No {title} Today</p>
			</div>
		);
	}

	return (
		<div className="bg-input-bg border border-border rounded-xl p-5 flex flex-col h-full shadow-sm">
			<div className="flex items-center gap-3 mb-4">
				<MenuIcon meal={title} className="text-primary" />
				<div>
					<h3 className="text-xl font-semibold text-fg m-0">{title}</h3>
					{timing && <p className="text-xs text-muted m-0">{timing}</p>}
				</div>
			</div>

			<ul className="flex-grow space-y-2 text-muted">
				{items.map((item, index) => (
					// --- THE FIX IS HERE ---
					<li key={index} className="flex gap-2 items-center">
						{/* Use the Dot icon, which is a perfect small solid circle */}
						<Circle
							className="text-primary flex-shrink-0 self-center"
							size={6}
							fill="currentColor"
						/>
						<div className="flex-grow ">
							<MenuItem item={item} />
						</div>
					</li>
				))}
			</ul>

			{commonItems && (
				<div className="mt-4 pt-4 border-t border-border/50">
					<p className="text-xs font-semibold text-muted uppercase tracking-wider">
						Common Items
					</p>
					<p className="text-sm text-muted/80 mt-1">{commonItems}</p>
				</div>
			)}
		</div>
	);
};

export default MealCard;
