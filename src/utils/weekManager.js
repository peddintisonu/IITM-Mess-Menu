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

// --- Core Utility Functions ---

/**
 * Creates a new Date object representing the current time in India (IST, GMT+5:30).
 * This ensures all calculations based on "now" are consistent for all users.
 * @returns {Date} A new Date object for the current time in India.
 */
export const getIndianTime = () => {
	const now = new Date();
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
	const istOffset = 330 * 60000;
	return new Date(utcTime + istOffset);
};

/**
 * Securely converts a Date object to a 'YYYY-MM-DD' string in its local timezone.
 * This is crucial for avoiding off-by-one-day errors caused by UTC conversion.
 * @param {Date} date The date to convert.
 * @returns {string} The formatted date string.
 */
export const toLocalDateString = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

// --- Exported App Logic Functions ---

export function isSetupComplete() {
	return localStorage.getItem(SETUP_COMPLETE_KEY) === "true";
}

export function completeSetup(initialCategory) {
	localStorage.setItem(USER_CATEGORY_KEY, initialCategory);
	localStorage.setItem(SETUP_COMPLETE_KEY, "true");
}

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

export function getCurrentWeek() {
	const todayInIndia = getIndianTime();
	return getWeekForDate(todayInIndia);
}

export function setUserCategory(category) {
	localStorage.setItem(USER_CATEGORY_KEY, category);
}

export function getUserCategory() {
	return localStorage.getItem(USER_CATEGORY_KEY);
}

export const getCurrentDay = () => {
	const todayInIndia = getIndianTime();
	const dayIndex = todayInIndia.getDay();
	return DAYS_OF_WEEK[dayIndex];
};
