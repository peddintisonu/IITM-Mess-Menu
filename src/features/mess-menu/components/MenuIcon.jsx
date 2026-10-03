import React from "react";
import { Coffee, UtensilsCrossed, Cookie, MoonStar } from "lucide-react";

/**
 * A component that displays a relevant icon based on the meal type.
 * @param {{ meal: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner', className?: string }} props
 */
const MenuIcon = ({ meal, className }) => {
	switch (meal) {
		case "Breakfast":
			return <Coffee size={24} className={className} />;
		case "Lunch":
			return <UtensilsCrossed size={24} className={className} />;
		case "Snacks":
			return <Cookie size={24} className={className} />;
		case "Dinner":
			return <MoonStar size={24} className={className} />;
		default:
			// Default to a general food icon if the meal type is unexpected
			return <UtensilsCrossed size={24} className={className} />;
	}
};

export default MenuIcon;
