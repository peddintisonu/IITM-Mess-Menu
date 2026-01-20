import data from "../database/messMenu.json"; // Import Data Here
import { MEALS, CATEGORY_REFERENCE_DATES } from "../api/constants";

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
const REFERENCE_WEEK = "A";

// --- localStorage Keys ---
const SETUP_COMPLETE_KEY = "isSetupComplete";
const USER_CYCLE_PREFERENCES_KEY = "userCyclePreferences";
const LAST_SEEN_CYCLE_NAME_KEY = "lastSeenCycleName";

// --- Core Utility Functions ---

export const getIndianTime = () => {
	const now = new Date();
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
	const istOffset = 330 * 60000;
	return new Date(utcTime + istOffset);
};

export const toLocalDateString = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

// --- Cycle Logic (Moved here to prevent Circular Dependency) ---

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

// --- App Logic Functions ---

export function isSetupComplete() {
	return localStorage.getItem(SETUP_COMPLETE_KEY) === "true";
}

export function completeSetup(initialCycleName, initialCategory) {
	setPreferenceForCycle(initialCycleName, initialCategory);
	localStorage.setItem(SETUP_COMPLETE_KEY, "true");
}

/**
 * Calculates the Week based on Date AND Category Reference Date.
 */
export function getWeekForDate(targetDate, category) {
	// 1. Get the specific start date for this category (e.g. Protein vs Regular)
	// If category is null/undefined, fallback to DEFAULT
	const refKey =
		category && CATEGORY_REFERENCE_DATES[category] ? category : "DEFAULT";
	const refDateString = CATEGORY_REFERENCE_DATES[refKey];

	const referenceDate = new Date(`${refDateString}T00:00:00+05:30`);
	const dateToCalculate = new Date(targetDate);

	referenceDate.setHours(0, 0, 0, 0);
	dateToCalculate.setHours(0, 0, 0, 0);

	const timeDifference = dateToCalculate.getTime() - referenceDate.getTime();
	const daysDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));

	let weeksPassed = Math.floor(daysDifference / 7);

	const referenceIndex = WEEKS.indexOf(REFERENCE_WEEK);
	const newIndex =
		(((referenceIndex + weeksPassed) % WEEKS.length) + WEEKS.length) %
		WEEKS.length;

	return WEEKS[newIndex];
}

/**
 * Smartly determines current week.
 * If category is passed, uses it.
 * If NOT passed, automatically fetches user preference.
 */
export function getCurrentWeek(category) {
	const todayInIndia = getIndianTime();
	// If no category passed, try to get from preferences
	const effectiveCategory = category || getUserCategory();
	return getWeekForDate(todayInIndia, effectiveCategory);
}

export const getCurrentDay = () => {
	const todayInIndia = getIndianTime();
	const dayIndex = todayInIndia.getDay();
	return DAYS_OF_WEEK[dayIndex];
};

// --- Preference Management ---

export const getCyclePreferences = () => {
	const data = localStorage.getItem(USER_CYCLE_PREFERENCES_KEY);
	try {
		return data ? JSON.parse(data) : {};
	} catch {
		return {};
	}
};

export const setCyclePreferences = (preferences) => {
	localStorage.setItem(USER_CYCLE_PREFERENCES_KEY, JSON.stringify(preferences));
};

export const getPreferenceForCycle = (cycleName) => {
	if (!cycleName) return null;
	const preferences = getCyclePreferences();
	return preferences[cycleName] || null;
};

export const setPreferenceForCycle = (cycleName, category) => {
	if (!cycleName || !category) return;
	const currentPreferences = getCyclePreferences();
	currentPreferences[cycleName] = category;
	setCyclePreferences(currentPreferences);
};

export function getUserCategory() {
	const todayInIndia = getIndianTime();
	const currentCycle = getCycleForDate(todayInIndia); // Now works correctly

	if (!currentCycle || !currentCycle.name) {
		return null;
	}

	return getPreferenceForCycle(currentCycle.name);
}

export function updateLastSeenCycle(cycleName) {
	if (cycleName) {
		localStorage.setItem(LAST_SEEN_CYCLE_NAME_KEY, cycleName);
	}
}

export function clearAllUserData() {
	const appKeys = [
		"userCyclePreferences",
		"isSetupComplete",
		"lastSeenCycleName",
		"theme",
	];
	appKeys.forEach((key) => localStorage.removeItem(key));
	window.location.reload();
}

export const getMealStates = () => {
	const todayInIndia = getIndianTime();
	const currentTime = todayInIndia.getHours() * 60 + todayInIndia.getMinutes();
	const mealStatuses = {};
	let nextMealFound = false;

	MEALS.forEach((meal) => {
		const [startHour, startMinute] = meal.start.split(":").map(Number);
		const [endHour, endMinute] = meal.end.split(":").map(Number);
		const startTime = startHour * 60 + startMinute;
		const endTime = endHour * 60 + endMinute;

		if (currentTime >= startTime && currentTime <= endTime) {
			mealStatuses[meal.value] = "active";
			nextMealFound = true;
		} else if (currentTime > endTime) {
			mealStatuses[meal.value] = "past";
		} else {
			mealStatuses[meal.value] = "future";
		}
	});

	if (!nextMealFound) {
		for (const meal of MEALS) {
			if (mealStatuses[meal.value] === "future") {
				mealStatuses[meal.value] = "active";
				break;
			}
		}
	}
	return mealStatuses;
};
