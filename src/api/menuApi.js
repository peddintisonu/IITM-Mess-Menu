import data from "../database/messMenu.json";
import ApiResponse from "./ApiResponse";
import {
	getCurrentWeek,
	getUserCategory,
	getCurrentDay,
	getWeekForDate,
} from "../utils/weekManager";
import { MENUS } from "./constants";

// --- Core Helper Functions ---

/**
 * A deep-merging utility to apply overrides. It recursively merges objects and
 * replaces arrays and other types. This version is secure against prototype pollution.
 * @param {object} base The base object to merge into.
 * @param {object} override The override object to apply.
 * @returns {object} The new, merged object.
 */
const deepMerge = (base, override) => {
	const merged = { ...base };
	for (const key in override) {
		if (Object.prototype.hasOwnProperty.call(override, key)) {
			if (
				Object.prototype.hasOwnProperty.call(merged, key) &&
				typeof merged[key] === "object" &&
				!Array.isArray(merged[key]) &&
				merged[key] !== null &&
				typeof override[key] === "object" &&
				!Array.isArray(override[key]) &&
				override[key] !== null
			) {
				merged[key] = deepMerge(merged[key], override[key]);
			} else {
				merged[key] = override[key];
			}
		}
	}
	return merged;
};

/**
 * Finds the cycle object that a given date falls within.
 * @param {Date} targetDate The date to check.
 * @returns {object | null} The cycle object.
 */
const getCycleForDate = (targetDate) => {
	const sortedCycles = [...data.cycles].sort(
		(a, b) => new Date(a.startDate) - new Date(b.startDate)
	);
	return (
		sortedCycles
			.slice()
			.reverse()
			.find((cycle) => {
				const startDate = new Date(cycle.startDate);
				startDate.setHours(0, 0, 0, 0);
				return startDate <= targetDate;
			}) || null
	);
};

/**
 * The core logic engine. It chronologically builds the official menu state for a given date,
 * correctly applying the base version and any subsequent permanent overrides.
 * @param {Date} date The target date.
 * @returns {{ menuContent: object, versionId: string } | null} The final menu content and the base version it came from.
 */
const getMenuContentForDate = (date) => {
	date.setHours(0, 0, 0, 0);

	const versionDates = Object.keys(data.versions).map((d) => new Date(d));
	const overrideDates = Object.keys(data.overrides || {}).map(
		(d) => new Date(d)
	);

	const applicableDates = [...versionDates, ...overrideDates]
		.filter((d) => d <= date)
		.sort((a, b) => a - b);

	if (applicableDates.length === 0) return null;

	let baseVersionKey = null;
	for (let i = applicableDates.length - 1; i >= 0; i--) {
		const dateKey = applicableDates[i].toISOString().split("T")[0];
		if (data.versions[dateKey]) {
			baseVersionKey = dateKey;
			break;
		}
	}

	if (!baseVersionKey) return null;

	let finalMenuContent = JSON.parse(
		JSON.stringify(data.versions[baseVersionKey].Messmenu.Categories)
	);
	const baseVersionDate = new Date(baseVersionKey);

	const applicableOverrides = applicableDates.filter((d) => {
		const dateKey = d.toISOString().split("T")[0];
		return (data.overrides || {})[dateKey] && d > baseVersionDate;
	});

	for (const overrideDate of applicableOverrides) {
		const overrideKey = overrideDate.toISOString().split("T")[0];
		finalMenuContent = deepMerge(finalMenuContent, data.overrides[overrideKey]);
	}

	return {
		menuContent: finalMenuContent,
		versionId: baseVersionKey,
	};
};

// --- Exported API Functions ---

/**
 * Provides a complete context for a given date, including all data layers
 * (versions, permanent overrides, and temporary event overrides).
 * This is used by the "Daily Menu Viewer" (TodaysMenu.jsx).
 * @param {Date} date The date for which to get the context.
 * @returns {object | null} An object with all necessary info, or null on failure.
 */
export const getContextForDate = (date) => {
	const cycle = getCycleForDate(date);
	const menuData = getMenuContentForDate(new Date(date));

	if (!menuData) return null;

	let { menuContent, versionId } = menuData;

	// Find any temporary event that is active for the given date
	const activeEvent = (data.eventOverrides || []).find((event) => {
		const startDate = new Date(event.startDate);
		const endDate = new Date(event.endDate);
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);
		return date >= startDate && date <= endDate;
	});

	let eventName = null;
	let eventDescription = null;

	if (activeEvent) {
		eventName = activeEvent.eventName;
		const dateString = date.toISOString().split("T")[0];

		// Find all rules within the event that apply to the specific date
		const activeRules = activeEvent.rules.filter(
			(rule) => rule.onDate === dateString
		);

		if (activeRules.length > 0) {
			// Create a clean snapshot of the base menu before applying any event changes
			// This is crucial for ensuring remaps always use original, unmodified data
			const baseMenuSnapshot = JSON.parse(JSON.stringify(menuContent));
			const weekForEventDate = getWeekForDate(date);

			let descriptions = [];

			// Process all active rules for the day
			for (const rule of activeRules) {
				if (rule.type === "remap" && rule.targetMeal && rule.sourceDay) {
					const { targetMeal, sourceDay } = rule;
					// Apply the remap to every category in the menu
					for (const category in menuContent) {
						// Get the source data from the clean snapshot
						const sourceMenu =
							baseMenuSnapshot[category]?.[weekForEventDate]?.schedule?.[
								sourceDay
							]?.[targetMeal];
						if (sourceMenu) {
							const dayOfWeek = date.toLocaleString("en-US", {
								weekday: "long",
							});
							// Ensure the nested structure exists before assigning
							if (!menuContent[category][weekForEventDate])
								menuContent[category][weekForEventDate] = { schedule: {} };
							if (!menuContent[category][weekForEventDate].schedule[dayOfWeek])
								menuContent[category][weekForEventDate].schedule[dayOfWeek] =
									{};
							// Apply the remapped menu
							menuContent[category][weekForEventDate].schedule[dayOfWeek][
								targetMeal
							] = sourceMenu;
						}
					}
				} else if (rule.type === "override" && rule.newMenu) {
					// Apply a content override by deep merging
					menuContent = deepMerge(menuContent, rule.newMenu);
				}

				// Collect any descriptions from the processed rules
				if (rule.description) {
					descriptions.push(rule.description);
				}
			}

			// Combine all collected descriptions into a single string
			if (descriptions.length > 0) {
				eventDescription = descriptions.join(" ");
			}
		}

		// If no specific rule had a description, fall back to the main event description
		if (eventName && !eventDescription && activeEvent.description) {
			eventDescription = activeEvent.description;
		}
	}

	const availableCategoryKeys = Object.keys(menuContent);
	const availableCategories = MENUS.filter((menu) =>
		availableCategoryKeys.includes(menu.value)
	);

	return {
		cycleName: cycle ? cycle.name : "No active cycle",
		versionId: versionId,
		eventName: eventName,
		eventDescription: eventDescription,
		menuContent: menuContent,
		availableCategories: availableCategories,
	};
};
/**
 * Provides a complete context for a given CYCLE, including permanent overrides
 * but ignoring temporary events. This is used by the MenuExplorer.
 * @param {object} cycle The cycle object containing startDate and endDate.
 * @returns {object | null} A context object for that cycle.
 */
export const getContextForCycle = (cycle) => {
	if (!cycle) return null;
	const context = getMenuContentForDate(new Date(cycle.endDate));
	if (!context) return null;

	const { menuContent, versionId } = context;
	const availableCategoryKeys = Object.keys(menuContent);
	const availableCategories = MENUS.filter((menu) =>
		availableCategoryKeys.includes(menu.value)
	);

	return {
		cycleName: cycle.name,
		versionId: versionId,
		menuContent: menuContent,
		availableCategories: availableCategories,
	};
};

/**
 * Gets a list of all defined cycles, formatted for use in a dropdown.
 * @returns {{value: string, label: string}[]}
 */
export const getAllCycles = () => {
	return data.cycles.map((cycle) => ({
		value: cycle.startDate,
		label: cycle.name,
	}));
};

/**
 * Gets a list of messes available in the CURRENT active menu version.
 * @returns {{value: string, label: string}[]}
 */
export const getAvailableCategoriesForCurrentVersion = () => {
	const context = getContextForDate(new Date());
	return context ? context.availableCategories : [];
};

/**
 * A convenience function to get the menu for the current day.
 * @returns {Promise<ApiResponse>}
 */
export const getTodaysMenu = async () => {
	try {
		const category = getUserCategory();
		const week = getCurrentWeek();
		const day = getCurrentDay();

		if (!category || !week || !day) {
			throw new Error("User context is not fully set up.");
		}

		const context = getContextForDate(new Date());
		if (!context) {
			throw new Error("Could not load menu context for today.");
		}

		const menuData = context.menuContent;
		const categoryData = menuData[category];
		if (!categoryData) {
			throw new Error(
				`Your preferred mess "${category}" is not available in the current menu.`
			);
		}

		const weekData = categoryData[week];
		const dayMenu = weekData?.schedule?.[day];

		if (!dayMenu) {
			return new ApiResponse(
				200,
				"Menu retrieved, but no items for this meal.",
				{}
			);
		}

		const commonItems = categoryData.common_items || {};
		const finalMenu = {
			Breakfast: dayMenu.Breakfast || [],
			Lunch: dayMenu.Lunch || [],
			Snacks: dayMenu.Snacks || [],
			Dinner: dayMenu.Dinner || [],
			common: {
				Breakfast: commonItems.Breakfast || "",
				Lunch: commonItems.Lunch || "",
				Snacks: commonItems.Snacks || "",
				Dinner: commonItems.Dinner || "",
			},
		};

		return new ApiResponse(
			200,
			"Today's menu retrieved successfully",
			finalMenu
		);
	} catch (error) {
		return new ApiResponse(500, error.message, null);
	}
};
