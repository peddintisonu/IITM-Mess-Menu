// src/api/menuApi.js

import data from "../database/messMenu.json";
import ApiResponse from "./ApiResponse";
import {
	getCurrentWeek,
	getUserCategory,
	getCurrentDay,
} from "../utils/weekManager";

// A direct reference to the core data for cleaner access
const menuData = data.Messmenu.Categories;

/**
 * Retrieves the menu for a specific day, week, and category.
 * This is the core data-fetching function.
 * @param {string} category - The menu category (e.g., "South_Veg").
 * @param {string} week - The menu week letter (e.g., "A", "B", "C", "D").
 * @param {string} day - The day of the week (e.g., "Monday").
 * @returns {Promise<ApiResponse>} A promise that resolves to an ApiResponse object.
 */
export const getDayMenu = async (category, week, day) => {
	try {
		const categoryData = menuData[category];
		if (!categoryData) {
			throw new Error(`Category "${category}" not found.`);
		}

		const weekData = categoryData[week];
		if (!weekData) {
			throw new Error(
				`Menu for week "${week}" in category "${category}" not found.`
			);
		}

		const dayMenu = weekData.schedule[day];
		if (!dayMenu) {
			throw new Error(`Menu for "${day}" not found in schedule.`);
		}

		const commonItems = categoryData.common_items || {};

		// Structure the final menu data
		const finalMenu = {
			Breakfast: dayMenu.Breakfast || [],
			Lunch: dayMenu.Lunch || [],
			Snacks: dayMenu.Snacks || [],
			Dinner: dayMenu.Dinner || [],
			common: {
				Breakfast: commonItems.Breakfast || "",
				Lunch: commonItems.Lunch || "",
				Dinner: commonItems.Dinner || "",
				Snacks: commonItems.Snacks || "",
			},
		};

		return new ApiResponse(200, "Menu retrieved successfully", finalMenu);
	} catch (error) {
		console.error("Error in getDayMenu:", error.message);
		return new ApiResponse(404, error.message, null);
	}
};

/**
 * Retrieves the entire menu schedule for a specific week and category.
 * @param {string} category - The menu category (e.g., "South_Veg").
 * @param {string} week - The menu week letter (e.g., "A", "B", "C", "D").
 * @returns {Promise<ApiResponse>} A promise that resolves to an ApiResponse object.
 */
export const getWeekMenu = async (category, week) => {
	try {
		const categoryData = menuData[category];
		if (!categoryData) {
			throw new Error(`Category "${category}" not found.`);
		}

		const weekData = categoryData[week];
		if (!weekData) {
			throw new Error(
				`Menu for week "${week}" in category "${category}" not found.`
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
		console.error("Error in getWeekMenu:", error.message);
		return new ApiResponse(404, error.message, null);
	}
};

/**
 * A convenience function to get the menu for the current day.
 * It automatically determines the category from localStorage and the week cycle.
 * @returns {Promise<ApiResponse>} A promise that resolves to the menu for today.
 */
export const getTodaysMenu = async () => {
	try {
		// Automatically determine the context using the weekManager
		const category = getUserCategory();
		const week = getCurrentWeek();
		const day = getCurrentDay();

		console.log(
			`Fetching today's menu for: Category=${category}, Week=${week}, Day=${day}`
		);

		// Reuse the core getDayMenu function
		const response = await getDayMenu(category, week, day);

		// Enhance the message with today's context if successful
		if (response.success) {
			response.message = `Today's menu for ${category} (Week ${week})`;
		}

		return response;
	} catch (error) {
		console.error("Error in getTodaysMenu:", error.message);
		return new ApiResponse(
			500,
			"Failed to determine context for today's menu.",
			null
		);
	}
};
