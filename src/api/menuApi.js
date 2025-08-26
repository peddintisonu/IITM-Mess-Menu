import data from "../database/messMenu.json";
import ApiResponse from "./ApiResponse";
import {
	getCurrentWeek,
	getUserCategory,
	getCurrentDay,
} from "../utils/weekManager";
import { MENUS } from "./constants";

// --- Core Helper Functions for the New Logic ---

/**
 * Finds the correct menu version key for a given date.
 * It iterates through all available versions and finds the most recent one
 * that started on or before the target date.
 * @param {Date} targetDate The date for which to find the menu version.
 * @returns {string | null} The version key (e.g., "2025-07-28") or null if not found.
 */
const getVersionKeyForDate = (targetDate) => {
	const availableVersionKeys = Object.keys(data.versions);
	targetDate.setHours(0, 0, 0, 0); // Normalize for accurate date comparison

	const applicableKeys = availableVersionKeys.filter((key) => {
		return new Date(key) <= targetDate;
	});

	if (applicableKeys.length === 0) return null;

	// Sort descending to find the most recent version key
	applicableKeys.sort((a, b) => new Date(b) - new Date(a));
	return applicableKeys[0];
};

/**
 * Finds the cycle object that a given date falls within.
 * This is now more robust: it finds the most recent cycle that has started.
 * @param {Date} targetDate The date to check.
 * @returns {object | null} The cycle object or null if no matching cycle is found.
 */
const getCycleForDate = (targetDate) => {
	// Ensure cycles are sorted by date to handle lookups correctly
	const sortedCycles = [...data.cycles].sort(
		(a, b) => new Date(a.startDate) - new Date(b.startDate)
	);

	// Find the last cycle that started on or before the target date. This is the correct logic.
	const applicableCycle = sortedCycles
		.slice()
		.reverse()
		.find((cycle) => {
			const startDate = new Date(cycle.startDate);
			startDate.setHours(0, 0, 0, 0); // Normalize date for comparison
			return startDate <= targetDate;
		});

	return applicableCycle || null; // Return the found cycle or null
};

// --- New Exported Functions for Calendar and Dynamic UI ---

/**
 * Provides a complete context object for any given date.
 * This is the primary function for powering the new calendar-driven UI.
 * @param {Date} date The date for which to get the context.
 * @returns {object | null} An object containing all necessary info, or null on failure.
 */
export const getContextForDate = (date) => {
	const versionKey = getVersionKeyForDate(date);
	const cycle = getCycleForDate(date);

	if (!versionKey || !data.versions[versionKey]) {
		return null; // No valid version found for this date
	}

	const menuContent = data.versions[versionKey].Messmenu.Categories;
	const availableCategoryKeys = Object.keys(menuContent);
	const availableCategories = MENUS.filter((menu) =>
		availableCategoryKeys.includes(menu.value)
	);

	return {
		cycleName: cycle ? cycle.name : "No active cycle",
		versionId: versionKey,
		menuContent: menuContent,
		availableCategories: availableCategories,
	};
};

/**
 * Gets a list of all defined cycles, formatted for use in a dropdown.
 * @returns {{value: string, label: string}[]} An array of all cycles.
 */
export const getAllCycles = () => {
	return data.cycles.map((cycle) => ({
		value: cycle.startDate, // Use startDate as a unique identifier
		label: cycle.name,
	}));
};

/**
 * Finds the latest menu version active within a specific cycle's date range.
 * @param {object} cycle The cycle object containing startDate and endDate.
 * @returns {object | null} A context object for that cycle, or null if no version is found.
 */
export const getContextForCycle = (cycle) => {
	if (!cycle || !cycle.startDate || !cycle.endDate) return null;

	const cycleStartDate = new Date(cycle.startDate);
	const cycleEndDate = new Date(cycle.endDate);
	cycleStartDate.setHours(0, 0, 0, 0);
	cycleEndDate.setHours(23, 59, 59, 999);

	const availableVersionKeys = Object.keys(data.versions);

	// Find all versions that started within this cycle's timeframe
	const applicableKeys = availableVersionKeys.filter((key) => {
		const versionDate = new Date(key);
		return versionDate >= cycleStartDate && versionDate <= cycleEndDate;
	});

	if (applicableKeys.length === 0) return null;

	// Sort descending to find the most recent (latest) version key within the cycle
	applicableKeys.sort((a, b) => new Date(b) - new Date(a));
	const latestVersionId = applicableKeys[0];

	const menuContent = data.versions[latestVersionId].Messmenu.Categories;
	const availableCategoryKeys = Object.keys(menuContent);
	const availableCategories = MENUS.filter((menu) =>
		availableCategoryKeys.includes(menu.value)
	);

	return {
		cycleName: cycle.name,
		versionId: latestVersionId,
		menuContent: menuContent,
		availableCategories: availableCategories,
	};
};

// --- Existing Functions (Maintained for current UI, but could be refactored later) ---

/**
 * A helper to get the data for the officially "current" menu version.
 * @returns {object | null} The `Categories` object for the current version.
 */
const getCurrentVersionData = () => {
	const currentKey = data.currentVersionKey;
	if (currentKey && data.versions[currentKey]) {
		return data.versions[currentKey].Messmenu.Categories;
	}
	return null;
};

/**
 * Gets a list of mess categories available in the CURRENT active menu version.
 * @returns {{value: string, label: string}[]} An array of available menu options.
 */
export const getAvailableCategoriesForCurrentVersion = () => {
	const menuData = getCurrentVersionData();
	if (!menuData) return [];

	const availableCategoryKeys = Object.keys(menuData);
	return MENUS.filter((menu) => availableCategoryKeys.includes(menu.value));
};

/**
 * Retrieves the menu for a specific day from the CURRENT active version.
 * @param {string} category The menu category.
 * @param {string} week The menu week letter (A, B, C, D).
 * @param {string} day The day of the week.
 * @returns {Promise<ApiResponse>} A promise resolving to an ApiResponse object.
 */
export const getDayMenu = async (category, week, day) => {
	try {
		const menuData = getCurrentVersionData();
		if (!menuData) {
			throw new Error(
				"Could not load the current menu version. Check messMenu.json configuration."
			);
		}
		// ... (The rest of this function remains the same as your provided code)
		const categoryData = menuData[category];
		if (!categoryData) throw new Error(`Category "${category}" not found.`);
		const weekData = categoryData[week];
		if (!weekData) throw new Error(`Menu for week "${week}" not found.`);
		const dayMenu = weekData.schedule[day];
		if (!dayMenu) throw new Error(`Menu for "${day}" not found.`);
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
		return new ApiResponse(200, "Menu retrieved successfully", finalMenu);
	} catch (error) {
		return new ApiResponse(404, error.message, null);
	}
};

/**
 * A convenience function to get the menu for the current day.
 * @returns {Promise<ApiResponse>} A promise resolving to the menu for today.
 */
export const getTodaysMenu = async () => {
	try {
		const category = getUserCategory();
		const week = getCurrentWeek();
		const day = getCurrentDay();
		if (!category || !week || !day) {
			throw new Error(
				"User context (category, week, or day) is not fully set up."
			);
		}
		return await getDayMenu(category, week, day);
	} catch (error) {
		return new ApiResponse(500, error.message, null);
	}
};
