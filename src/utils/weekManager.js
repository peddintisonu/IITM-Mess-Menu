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
const REFERENCE_DATE_STRING = "2025-07-28"; // This MUST be a Monday
const REFERENCE_WEEK = "A";

// --- localStorage Keys ---
const SETUP_COMPLETE_KEY = "isSetupComplete";
const USER_CATEGORY_KEY = "userPreferredCategory";

/**
 * Checks if the user has completed the initial setup (i.e., chosen their mess).
 * @returns {boolean} True if setup is complete, false otherwise.
 */
export function isSetupComplete() {
	return localStorage.getItem(SETUP_COMPLETE_KEY) === "true";
}

/**
 * Marks the initial setup as complete and saves the user's mess category.
 * @param {string} initialCategory The category selected by the user.
 */
export function completeSetup(initialCategory) {
	localStorage.setItem(USER_CATEGORY_KEY, initialCategory);
	localStorage.setItem(SETUP_COMPLETE_KEY, "true");
}

/**
 * A reusable function to calculate the A/B/C/D week for any given date.
 * This is the new core logic.
 * @param {Date} targetDate The date for which to calculate the week.
 * @returns {'A' | 'B' | 'C' | 'D'} The calculated week.
 */
export function getWeekForDate(targetDate) {
	const referenceDate = new Date(REFERENCE_DATE_STRING);
	// Use a copy of the targetDate to avoid modifying the original
	const dateToCalculate = new Date(targetDate);

	// Normalize dates to the start of the day for accurate calculations
	referenceDate.setHours(0, 0, 0, 0);
	dateToCalculate.setHours(0, 0, 0, 0);

	const timeDifference = dateToCalculate.getTime() - referenceDate.getTime();
	const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
	const weeksPassed = Math.floor(daysDifference / 7);

	const referenceIndex = WEEKS.indexOf(REFERENCE_WEEK);
	// Use Math.abs and handle negative weeksPassed for dates before the reference
	const newIndex = (referenceIndex + weeksPassed) % WEEKS.length;

	// Handle negative results from the modulo operator
	return WEEKS[(newIndex + WEEKS.length) % WEEKS.length];
}


/**
 * Calculates the current week (A, B, C, or D) based on today's date.
 * This function now uses the more generic getWeekForDate.
 * @returns {'A' | 'B' | 'C' | 'D'} The calculated current week.
 */
export function getCurrentWeek() {
	return getWeekForDate(new Date());
}
/**
 * Sets the user's preferred menu category in localStorage. Used for settings updates.
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
 * @returns {string} The name of the current day (e.g., "Monday").
 */
export const getCurrentDay = () => {
	const dayIndex = new Date().getDay();
	return DAYS_OF_WEEK[dayIndex];
};
