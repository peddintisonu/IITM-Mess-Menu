// --- Configuration ---
const WEEKS = ["A", "B", "C", "D"];
const DAYS_OF_WEEK = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

// --- localStorage Keys ---
const SETUP_COMPLETE_KEY = "isSetupComplete";
const CURRENT_WEEK_KEY = "currentMessWeek";
const LAST_UPDATE_KEY = "lastWeekUpdateDate";
const USER_CATEGORY_KEY = "userPreferredCategory";

/**
 * Checks if the user has completed the initial setup.
 * @returns {boolean} True if setup is complete, false otherwise.
 */
export function isSetupComplete() {
	return localStorage.getItem(SETUP_COMPLETE_KEY) === "true";
}

/**
 * Marks the initial setup as complete and saves the user's first choices.
 * @param {string} initialWeek The week selected by the user.
 * @param {string} initialCategory The category selected by the user.
 */
export function completeSetup(initialWeek, initialCategory) {
	localStorage.setItem(CURRENT_WEEK_KEY, initialWeek);
	localStorage.setItem(USER_CATEGORY_KEY, initialCategory);
	localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
	localStorage.setItem(SETUP_COMPLETE_KEY, "true");
}

/**
 * Manually sets the current week cycle and resets the update timer.
 * @param {'A' | 'B' | 'C' | 'D'} week The week to set.
 */
export function setCurrentWeek(week) {
	if (!WEEKS.includes(week)) {
		return;
	}
	localStorage.setItem(CURRENT_WEEK_KEY, week);
	localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
}

/**
 * Gets the current week, automatically advancing the cycle if a Monday has passed.
 * @returns {'A' | 'B' | 'C' | 'D' | null} The current week, or null if not set.
 */
export function getCurrentWeek() {
	const storedWeek = localStorage.getItem(CURRENT_WEEK_KEY);
	const lastUpdateStr = localStorage.getItem(LAST_UPDATE_KEY);

	if (!storedWeek || !lastUpdateStr) {
		return null; // The modal should handle this case
	}

	const lastUpdateDate = new Date(lastUpdateStr);
	const currentDate = new Date();
	lastUpdateDate.setHours(0, 0, 0, 0);
	currentDate.setHours(0, 0, 0, 0);

	const timeDifference = currentDate.getTime() - lastUpdateDate.getTime();
	const daysDifference = timeDifference / (1000 * 3600 * 24);
	const lastUpdateDay = new Date(lastUpdateStr).getDay();
	const mondaysPassed = Math.floor((daysDifference + lastUpdateDay) / 7);

	if (mondaysPassed > 0) {
		const currentIndex = WEEKS.indexOf(storedWeek);
		const newIndex = (currentIndex + mondaysPassed) % WEEKS.length;
		const newWeek = WEEKS[newIndex];

		localStorage.setItem(CURRENT_WEEK_KEY, newWeek);
		localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
		return newWeek;
	}

	return storedWeek;
}

/**
 * Sets the user's preferred menu category in localStorage.
 * @param {string} category The category to save.
 */
export function setUserCategory(category) {
	localStorage.setItem(USER_CATEGORY_KEY, category);
}

/**
 * Gets the user's preferred menu category from localStorage.
 * @returns {string | null} The saved category, or null if not set.
 */
export function getUserCategory() {
	return localStorage.getItem(USER_CATEGORY_KEY);
}

/**
 * Gets the current day of the week as a string.
 * @returns {string} The name of the current day.
 */
export const getCurrentDay = () => {
	const dayIndex = new Date().getDay();
	return DAYS_OF_WEEK[dayIndex];
};
