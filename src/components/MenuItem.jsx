import React from "react";
import reactStringReplace from "react-string-replace";

/**
 * A robust component to render a single menu item. It intelligently handles:
 * 1. An object with a special flag: { name: "Dal Fry", isSpecial: true }
 * 2. A string with inline special markers like "*Omelette* / Oats"
 * 3. A simple string: "Plain Rice"
 *
 * @param {{ item: string | { name: string, isSpecial: boolean } }} props
 */
const MenuItem = ({ item }) => {
	// --- Case 1: Handle the new object format ---
	if (
		typeof item === "object" &&
		item !== null &&
		typeof item.name === "string"
	) {
		if (item.isSpecial) {
			return <span className="font-bold text-primary">{item.name}</span>;
		}
		return <span>{item.name}</span>;
	}

	// --- Case 2: Handle string formats ---
	if (typeof item !== "string") {
		// If it's not an object or a string, render nothing to prevent crashes.
		return null;
	}

	// Use the library to find all occurrences of *text* and replace them.
	// The regex looks for a star, captures everything until the next star, and then matches the closing star.
	let replacedText = reactStringReplace(item, /\*([^*]+)\*/g, (match, i) => (
		<strong key={i} className="font-bold text-primary">
			{match}
		</strong>
	));

	return <span>{replacedText}</span>;
};

export default MenuItem;
