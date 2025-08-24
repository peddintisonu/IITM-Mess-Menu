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
 * Calculates the current week (A, B, C, or D) based on a fixed reference date.
 * This function is fully automated and does not rely on user input.
 * @returns {'A' | 'B' | 'C' | 'D'} The calculated current week.
 */
export function getCurrentWeek() {
	const referenceDate = new Date(REFERENCE_DATE_STRING);
	const today = new Date();

	// Normalize dates to the start of the day to avoid timezone/DST issues
	referenceDate.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);

	const timeDifference = today.getTime() - referenceDate.getTime();
	const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
	const weeksPassed = Math.floor(daysDifference / 7);

	const referenceIndex = WEEKS.indexOf(REFERENCE_WEEK);
	const newIndex = (referenceIndex + weeksPassed) % WEEKS.length;

	return WEEKS[newIndex];
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
