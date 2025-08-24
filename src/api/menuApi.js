import data from "../database/messMenu.json";
import ApiResponse from "./ApiResponse";
import {
	getCurrentWeek,
	getUserCategory,
	getCurrentDay,
} from "../utils/weekManager";
import { MENUS } from "./constants";

/**
 * A central helper function to get the data for the currently active menu version.
 * It encapsulates the logic of reading the versioned JSON structure, making other
 * functions cleaner and ensuring consistency.
 * @returns {object | null} The `Categories` object for the current version, or null on failure.
 */
const getCurrentVersionData = () => {
	const currentKey = data.currentVersionKey;
	if (currentKey && data.versions[currentKey]) {
		return data.versions[currentKey].Messmenu.Categories;
	}
	// This indicates a configuration error in messMenu.json
	return null;
};

/**
 * Gets a list of mess categories that are available in the CURRENT active menu version.
 * This is used to dynamically populate the dropdown selectors in the UI.
 * @returns {{value: string, label: string}[]} An array of available menu options.
 */
export const getAvailableCategoriesForCurrentVersion = () => {
	const menuData = getCurrentVersionData();
	if (!menuData) {
		return []; // Return empty if the menu data is not configured correctly
	}

	const availableCategoryKeys = Object.keys(menuData);

	// Filter the master list from constants.js to only include available categories
	const availableMenus = MENUS.filter(menu =>
		availableCategoryKeys.includes(menu.value)
	);

	return availableMenus;
};

/**
 * Retrieves the menu for a specific day, week, and category from the CURRENT active version.
 * @param {string} category The menu category (e.g., "South_Veg").
 * @param {string} week The menu week letter (e.g., "A", "B", "C", "D").
 * @param {string} day The day of the week (e.g., "Monday").
 * @returns {Promise<ApiResponse>} A promise resolving to an ApiResponse object.
 */
export const getDayMenu = async (category, week, day) => {
	try {
		const menuData = getCurrentVersionData();
		if (!menuData) {
			throw new Error(
				"Could not load the current menu version. Please check messMenu.json configuration."
			);
		}

		const categoryData = menuData[category];
		if (!categoryData) {
			throw new Error(
				`Category "${category}" not found in the current menu version.`
			);
		}

		const weekData = categoryData[week];
		if (!weekData) {
			throw new Error(
				`Menu for week "${week}" not found in category "${category}".`
			);
		}

		const dayMenu = weekData.schedule[day];
		if (!dayMenu) {
			throw new Error(`Menu for "${day}" not found in the schedule.`);
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

		return new ApiResponse(200, "Menu retrieved successfully", finalMenu);
	} catch (error) {
		return new ApiResponse(404, error.message, null);
	}
};

/**
 * A convenience function to get the menu for the current day.
 * It automatically determines the category, week, and day, and fetches the menu
 * from the currently active version.
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

		// Reuses the core getDayMenu function, which is now version-aware.
		return await getDayMenu(category, week, day);
	} catch (error) {
		return new ApiResponse(500, error.message, null);
	}
};

/**
 * Retrieves the entire menu schedule for a specific week and category from the CURRENT version.
 * @param {string} category The menu category (e.g., "South_Veg").
 * @param {string} week The menu week letter (e.g., "A", "B", "C", "D").
 * @returns {Promise<ApiResponse>} A promise resolving to an ApiResponse object.
 */
export const getWeekMenu = async (category, week) => {
	try {
		const menuData = getCurrentVersionData();
		if (!menuData) {
			throw new Error(
				"Could not load the current menu version. Please check messMenu.json configuration."
			);
		}

		const categoryData = menuData[category];
		if (!categoryData) {
			throw new Error(
				`Category "${category}" not found in the current menu version.`
			);
		}

		const weekData = categoryData[week];
		if (!weekData) {
			throw new Error(
				`Menu for week "${week}" not found in category "${category}".`
			);
		}

		const weekSchedule = weekData.schedule;
		const commonItems = categoryData.common_items || {};

		const fullWeekData = {
			source: weekData.source,
			schedule: weekSchedule,
			common_items: commonItems,
		};

		return new ApiResponse(
			200,
			`Full menu for Week ${week} retrieved`,
			fullWeekData
		);
	} catch (error) {
		return new ApiResponse(404, error.message, null);
	}
};
