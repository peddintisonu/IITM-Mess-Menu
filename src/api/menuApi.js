import data from "../database/messMenu.json";
import {
	getCurrentDay,
	getCurrentWeek,
	getIndianTime,
	getUserCategory,
	getWeekForDate,
	toLocalDateString,
} from "../utils/weekManager";
import ApiResponse from "./ApiResponse";
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

const getMenuContentForDate = (date) => {
	// 1. Normalize the input date to the start of the day to ensure consistent comparisons
	const targetDate = new Date(date);
	targetDate.setHours(0, 0, 0, 0);

	const versionDates = Object.keys(data.versions).map((d) => new Date(d));
	const overrideDates = Object.keys(data.overrides || {}).map(
		(d) => new Date(d),
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
		JSON.stringify(data.versions[baseVersionKey].Messmenu.Categories),
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

export const getCycleForDate = (targetDate) => {
	const sortedCycles = [...data.cycles].sort(
		(a, b) => new Date(a.startDate) - new Date(b.startDate),
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
			(rule) => rule.onDate === dateString,
		);

		if (activeRules.length > 0) {
			const baseMenuSnapshot = JSON.parse(JSON.stringify(menuContent));
			const weekForEventDate = getWeekForDate(date);
			const dayOfWeek = date.toLocaleString("en-US", { weekday: "long" });
			let descriptions = [];

			for (const rule of activeRules) {
				// --- 1. REMAP LOGIC (Unchanged) ---
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
				// --- 2. OVERRIDE LOGIC (With "All_Categories" Support) ---
				else if (rule.type === "override" && rule.targetMeal && rule.items) {
					const { targetMeal, items } = rule;
					const globalItems = items["All_Categories"];

					// If global items exist, we iterate ALL menu categories.
					// Otherwise, we only iterate the specific categories listed in items.
					const categoriesToProcess = globalItems
						? Object.keys(menuContent)
						: Object.keys(items);

					for (const category of categoriesToProcess) {
						if (Object.prototype.hasOwnProperty.call(menuContent, category)) {
							// Determine which food list to use: Specific > Global
							const foodList = items[category] || globalItems;

							if (foodList) {
								if (!menuContent[category][weekForEventDate])
									menuContent[category][weekForEventDate] = { schedule: {} };
								if (
									!menuContent[category][weekForEventDate].schedule[dayOfWeek]
								)
									menuContent[category][weekForEventDate].schedule[dayOfWeek] =
										{};

								// REPLACE items
								menuContent[category][weekForEventDate].schedule[dayOfWeek][
									targetMeal
								] = foodList;
							}
						}
					}
				}
				// --- 3. ADDON LOGIC (With "All_Categories" Support) ---
				else if (rule.type === "addon" && rule.targetMeal && rule.items) {
					const { targetMeal, items } = rule;
					const globalItems = items["All_Categories"];

					const categoriesToProcess = globalItems
						? Object.keys(menuContent)
						: Object.keys(items);

					for (const category of categoriesToProcess) {
						if (Object.prototype.hasOwnProperty.call(menuContent, category)) {
							const itemsToAdd = items[category] || globalItems;

							if (itemsToAdd) {
								if (!menuContent[category][weekForEventDate])
									menuContent[category][weekForEventDate] = { schedule: {} };
								if (
									!menuContent[category][weekForEventDate].schedule[dayOfWeek]
								)
									menuContent[category][weekForEventDate].schedule[dayOfWeek] =
										{};

								const currentItems =
									menuContent[category][weekForEventDate].schedule[dayOfWeek][
										targetMeal
									] || [];

								// APPEND items
								menuContent[category][weekForEventDate].schedule[dayOfWeek][
									targetMeal
								] = [...currentItems, ...itemsToAdd];
							}
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
		availableCategoryKeys.includes(menu.value),
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
		availableCategoryKeys.includes(menu.value),
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
				`Your preferred mess "${category}" is not available in the current menu.`,
			);
		}

		const weekData = categoryData[week];
		const dayMenu = weekData?.schedule?.[day];

		if (!dayMenu) {
			return new ApiResponse(
				200,
				"Menu retrieved, but no items for this meal.",
				{},
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
			finalMenu,
		);
	} catch (error) {
		return new ApiResponse(500, error.message, null);
	}
};

/**
 * Finds the current cycle and its immediate previous and next neighbors.
 * This is the single source of truth for the settings modal and calendar range.
 * @returns {{previous: object | null, current: object | null, next: object | null}}
 */
export const getNeighboringCycles = () => {
	// Ensure cycles are sorted chronologically.
	const sortedCycles = [...data.cycles].sort(
		(a, b) => new Date(a.startDate) - new Date(b.startDate),
	);
	const today = getIndianTime();
	today.setHours(0, 0, 0, 0); // Normalize today for accurate comparison

	// --- THE DEFINITIVE FIX IS HERE ---

	// 1. Find the index of the cycle that is TRULY active right now.
	const trueCurrentIndex = sortedCycles.findIndex((cycle) => {
		const startDate = new Date(cycle.startDate);
		const endDate = new Date(cycle.endDate);
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999); // Cover the entire end day
		return today >= startDate && today <= endDate;
	});

	// 2. Handle all possible scenarios based on the result.
	if (trueCurrentIndex !== -1) {
		// --- Happy Path: We are currently within an active cycle. ---
		return {
			previous: sortedCycles[trueCurrentIndex - 1] || null,
			current: sortedCycles[trueCurrentIndex],
			next: sortedCycles[trueCurrentIndex + 1] || null,
		};
	} else {
		// --- Edge Case: We are in a "gap" between cycles. ---
		// Find the next upcoming cycle and treat it as "current" for display.
		const nextUpcomingIndex = sortedCycles.findIndex(
			(cycle) => new Date(cycle.startDate) > today,
		);

		if (nextUpcomingIndex !== -1) {
			return {
				previous: sortedCycles[nextUpcomingIndex - 1] || null,
				current: sortedCycles[nextUpcomingIndex], // The next one is "current"
				next: sortedCycles[nextUpcomingIndex + 1] || null,
			};
		} else {
			// We are past all defined cycles. The last cycle is "current".
			const lastIndex = sortedCycles.length - 1;
			return {
				previous: sortedCycles[lastIndex - 1] || null,
				current: sortedCycles[lastIndex] || null,
				next: null,
			};
		}
	}
};

/**
 * Determines the valid date range for the calendar based on the neighboring cycles.
 * The range spans from the start of the previous cycle (if it exists)
 * to the end of the next cycle (if it exists).
 * @returns {{minDate: Date, maxDate: Date} | null} An object with the date range.
 */
export const getCalendarDateRange = () => {
	const { previous, current, next } = getNeighboringCycles();

	if (!current) {
		// If there are no cycles at all, return null.
		return null;
	}

	// Determine the minimum selectable date.
	// If a previous cycle exists, the range starts from its start date.
	// Otherwise, it starts from the current cycle's start date.
	const minDate = new Date(previous ? previous.startDate : current.startDate);

	// Determine the maximum selectable date.
	// If a next cycle exists, the range ends at its end date.
	// Otherwise, it ends at the current cycle's end date.
	const maxDate = new Date(next ? next.endDate : current.endDate);

	return { minDate, maxDate };
};
