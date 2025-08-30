import { getCycleForDate } from "../api/menuApi";

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
const USER_CYCLE_PREFERENCES_KEY = "userCyclePreferences";
const LAST_SEEN_CYCLE_NAME_KEY = "lastSeenCycleName";

// --- Core Utility Functions ---

/**
 * Creates a new Date object representing the current time in India (IST, GMT+5:30).
 * @returns {Date}
 */
export const getIndianTime = () => {
	const now = new Date();
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
	const istOffset = 330 * 60000;
	return new Date(utcTime + istOffset);
};

/**
 * Securely converts a Date object to a 'YYYY-MM-DD' string in its local timezone.
 * @param {Date} date The date to convert.
 * @returns {string}
 */
export const toLocalDateString = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

// --- App Logic Functions ---

/**
 * Checks if the user has completed the initial setup.
 * @returns {boolean}
 */
export function isSetupComplete() {
	return localStorage.getItem(SETUP_COMPLETE_KEY) === "true";
}

/**
 * Marks the initial setup as complete and sets the first preference.
 * This should be used only for the very first time a user sets up the app.
 * @param {string} initialCycleName The name of the cycle.
 * @param {string} initialCategory The category selected.
 */
export function completeSetup(initialCycleName, initialCategory) {
	setPreferenceForCycle(initialCycleName, initialCategory); // Use the new system
	localStorage.setItem(SETUP_COMPLETE_KEY, "true");
}

/**
 * Calculates the A/B/C/D week for any given date.
 * @param {Date} targetDate The date for which to calculate the week.
 * @returns {'A' | 'B' | 'C' | 'D'}
 */
export function getWeekForDate(targetDate) {
	const referenceDate = new Date(`${REFERENCE_DATE_STRING}T00:00:00+05:30`);
	const dateToCalculate = new Date(targetDate);
	referenceDate.setHours(0, 0, 0, 0);
	dateToCalculate.setHours(0, 0, 0, 0);
	const timeDifference = dateToCalculate.getTime() - referenceDate.getTime();
	const daysDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
	const weeksPassed = Math.floor(daysDifference / 7);
	const referenceIndex = WEEKS.indexOf(REFERENCE_WEEK);
	const newIndex = (referenceIndex + weeksPassed) % WEEKS.length;
	return WEEKS[(newIndex + WEEKS.length) % WEEKS.length];
}

/**
 * Calculates the current week (A, B, C, or D) based on today's date in India.
 * @returns {'A' | 'B' | 'C' | 'D'}
 */
export function getCurrentWeek() {
	const todayInIndia = getIndianTime();
	return getWeekForDate(todayInIndia);
}

/**
 * Gets the current day of the week as a string, based on the time in India.
 * @returns {string}
 */
export const getCurrentDay = () => {
	const todayInIndia = getIndianTime();
	const dayIndex = todayInIndia.getDay();
	return DAYS_OF_WEEK[dayIndex];
};

// --- Cycle-Aware Preference Management ---

/**
 * Reads the entire cycle preferences object from localStorage.
 * @returns {object} The preferences object, or an empty object if none exists.
 */
export const getCyclePreferences = () => {
	const data = localStorage.getItem(USER_CYCLE_PREFERENCES_KEY);
	try {
		return data ? JSON.parse(data) : {};
	} catch {
		return {};
	}
};

/**
 * Writes the entire cycle preferences object to localStorage.
 * @param {object} preferences The full preferences object to save.
 */
export const setCyclePreferences = (preferences) => {
	localStorage.setItem(USER_CYCLE_PREFERENCES_KEY, JSON.stringify(preferences));
};

/**
 * Gets the user's saved preference for a specific cycle by its name.
 * @param {string} cycleName The name of the cycle.
 * @returns {string | null} The saved category, or null if not set.
 */
export const getPreferenceForCycle = (cycleName) => {
	if (!cycleName) return null;
	const preferences = getCyclePreferences();
	return preferences[cycleName] || null;
};

/**
 * Sets the user's preference for a specific cycle by its name.
 * @param {string} cycleName The name of the cycle.
 * @param {string} category The category to save for that cycle.
 */
export const setPreferenceForCycle = (cycleName, category) => {
	if (!cycleName || !category) return;
	const currentPreferences = getCyclePreferences();
	currentPreferences[cycleName] = category;
	setCyclePreferences(currentPreferences);
};

/**
 * Gets the user's preferred category for the CURRENTLY active cycle.
 * This is the main function the app will use to determine what menu to show.
 * @returns {string | null}
 */
export function getUserCategory() {
	const todayInIndia = getIndianTime();
	const currentCycle = getCycleForDate(todayInIndia);

	if (!currentCycle || !currentCycle.name) {
		return null;
	}

	return getPreferenceForCycle(currentCycle.name);
}

/**
 * Updates the localStorage with the name of the cycle the user is currently seeing.
 * This is used to detect when a new cycle has begun.
 * @param {string} cycleName The name of the current cycle.
 */
export function updateLastSeenCycle(cycleName) {
    if (cycleName) {
        localStorage.setItem(LAST_SEEN_CYCLE_NAME_KEY, cycleName);
    }
}

/**
 * Deletes all app-related data from localStorage and reloads the page.
 * This effectively resets the app to its initial first-time-user state.
 */
export function clearAllUserData() {
	// List all the keys your app uses in localStorage
	const appKeys = [
		"userCyclePreferences",
		"isSetupComplete",
		"lastSeenCycleName",
		"theme" // It's good practice to reset the theme as well
	];

	// Remove each key
	appKeys.forEach(key => localStorage.removeItem(key));

	// Reload the page to force the initial setup prompt
	window.location.reload();
}