import data from "../database/messMenu.json";
import ApiResponse from "./ApiResponse";
import {
	getCurrentWeek,
	getUserCategory,
	getCurrentDay,
	getWeekForDate,
	getIndianTime,
	toLocalDateString,
} from "../utils/weekManager";
import { MENUS } from "./constants";

// --- Core Helper Functions ---

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

const getMenuContentForDate = (date) => {
	// 1. Normalize the input date to the start of the day to ensure consistent comparisons
	const targetDate = new Date(date);
	targetDate.setHours(0, 0, 0, 0);

	const versionDates = Object.keys(data.versions).map((d) => new Date(d));
	const overrideDates = Object.keys(data.overrides || {}).map(
		(d) => new Date(d)
	);

	const applicableDates = [...versionDates, ...overrideDates]
		.filter((d) => {
			const checkDate = new Date(d);
			checkDate.setHours(0, 0, 0, 0);
			return checkDate <= targetDate;
		})
		.sort((a, b) => a - b);

	if (applicableDates.length === 0) return null;

	let baseVersionKey = null;
	for (let i = applicableDates.length - 1; i >= 0; i--) {
		const dateKey = toLocalDateString(applicableDates[i]);
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
	baseVersionDate.setHours(0, 0, 0, 0);

	// 2. The crucial fix for the override logic
	const applicableOverrides = applicableDates.filter((d) => {
		const overrideDate = new Date(d);
		overrideDate.setHours(0, 0, 0, 0);
		const dateKey = toLocalDateString(overrideDate);
		// An override is valid if its date is ON OR AFTER the base version's start date
		return (data.overrides || {})[dateKey] && overrideDate >= baseVersionDate;
	});

	for (const overrideDate of applicableOverrides) {
		const overrideKey = toLocalDateString(overrideDate);
		finalMenuContent = deepMerge(finalMenuContent, data.overrides[overrideKey]);
	}

	return {
		menuContent: finalMenuContent,
		versionId: baseVersionKey,
	};
};
// --- Exported API Functions ---

export const getContextForDate = (date) => {
	const cycle = getCycleForDate(date);
	const baseMenuData = getMenuContentForDate(new Date(date));

	if (!baseMenuData) return null;

	let { menuContent, versionId } = baseMenuData;

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
		const dateString = toLocalDateString(date);
		const activeRules = activeEvent.rules.filter(
			(rule) => rule.onDate === dateString
		);

		if (activeRules.length > 0) {
			const baseMenuSnapshot = JSON.parse(JSON.stringify(menuContent));
			const weekForEventDate = getWeekForDate(date);
			const dayOfWeek = date.toLocaleString("en-US", { weekday: "long" });
			let descriptions = [];

			for (const rule of activeRules) {
				// Remap logic remains the same, using the clean snapshot
				if (rule.type === "remap" && rule.targetMeal && rule.sourceDay) {
					const { targetMeal, sourceDay } = rule;
					for (const category in menuContent) {
						const sourceMenu =
							baseMenuSnapshot[category]?.[weekForEventDate]?.schedule?.[
								sourceDay
							]?.[targetMeal];
						if (sourceMenu) {
							if (!menuContent[category][weekForEventDate])
								menuContent[category][weekForEventDate] = { schedule: {} };
							if (!menuContent[category][weekForEventDate].schedule[dayOfWeek])
								menuContent[category][weekForEventDate].schedule[dayOfWeek] =
									{};
							menuContent[category][weekForEventDate].schedule[dayOfWeek][
								targetMeal
							] = sourceMenu;
						}
					}
				}
				// --- THE NEW, SMARTER OVERRIDE LOGIC ---
				else if (rule.type === "override" && rule.targetMeal && rule.items) {
					const { targetMeal, items } = rule;
					// Iterate through the categories specified in the rule's 'items' object
					for (const category in items) {
						// Check if this category exists in our main menu data
						if (Object.prototype.hasOwnProperty.call(menuContent, category)) {
							// Ensure the nested structure exists before assigning the new items
							if (!menuContent[category][weekForEventDate])
								menuContent[category][weekForEventDate] = { schedule: {} };
							if (!menuContent[category][weekForEventDate].schedule[dayOfWeek])
								menuContent[category][weekForEventDate].schedule[dayOfWeek] =
									{};

							// Directly replace the meal's item list with the new one from the rule
							menuContent[category][weekForEventDate].schedule[dayOfWeek][
								targetMeal
							] = items[category];
						}
					}
				}

				if (rule.description) {
					descriptions.push(rule.description);
				}
			}

			if (descriptions.length > 0) {
				eventDescription = descriptions.join(" ");
			}
		}

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

export const getAllCycles = () => {
	return data.cycles.map((cycle) => ({
		value: cycle.startDate,
		label: cycle.name,
	}));
};

export const getAvailableCategoriesForCurrentVersion = () => {
	const todayInIndia = getIndianTime();
	const context = getContextForDate(todayInIndia);
	return context ? context.availableCategories : [];
};

export const getTodaysMenu = async () => {
	try {
		const category = getUserCategory();
		const week = getCurrentWeek();
		const day = getCurrentDay();

		if (!category || !week || !day) {
			throw new Error("User context is not fully set up.");
		}

		const todayInIndia = getIndianTime();
		const context = getContextForDate(todayInIndia);
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

/**
 * Scans all defined cycles to find the earliest start date and latest end date.
 * This provides the valid date range for the entire menu database.
 * @returns {{minDate: Date, maxDate: Date} | null} An object with the date range, or null.
 */
export const getCalendarDateRange = () => {
	if (!data.cycles || data.cycles.length === 0) {
		return null;
	}

	let minDate = new Date(data.cycles[0].startDate);
	let maxDate = new Date(data.cycles[0].endDate);

	for (const cycle of data.cycles) {
		const startDate = new Date(cycle.startDate);
		const endDate = new Date(cycle.endDate);
		if (startDate < minDate) {
			minDate = startDate;
		}
		if (endDate > maxDate) {
			maxDate = endDate;
		}
	}

	return { minDate, maxDate };
};
