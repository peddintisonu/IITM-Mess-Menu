import React, { useState, useEffect } from "react";
import { getContextForCycle, getAllCycles } from "../api/menuApi";
import {
	getCurrentDay,
	getCurrentWeek,
	getUserCategory,
} from "../utils/weekManager";
import { WEEKS, DAY_SHORTCUTS } from "../api/constants";
import MealCard from "./MealCard";
import SelectDropdown from "./SelectDropdown";
import data from "../database/messMenu.json"; // Import data directly for cycle lookup

/**
 * A component to explore the full menu for any cycle, mess, week, and day.
 * It dynamically updates selectors based on the chosen cycle to ensure valid options.
 */
const MenuExplorer = () => {
	const [menu, setMenu] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// State for dropdown options
	const [allCycles, setAllCycles] = useState([]);
	const [availableMenus, setAvailableMenus] = useState([]);

	// State for user's selections
	const [selectedCycle, setSelectedCycle] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState(
		() => getUserCategory() || ""
	);
	const [selectedWeek, setSelectedWeek] = useState(
		() => getCurrentWeek() || "A"
	);
	const [selectedDay, setSelectedDay] = useState(getCurrentDay);

	// Effect 1: Initialize cycle list and set the current cycle as default on load.
	useEffect(() => {
		const cyclesForDropdown = getAllCycles();
		setAllCycles(cyclesForDropdown);

		const today = new Date();
		// Find the last cycle that has started based on today's date
		const currentCycleData = data.cycles
			.slice()
			.reverse()
			.find((c) => new Date(c.startDate) <= today);

		if (currentCycleData) {
			setSelectedCycle(currentCycleData);
		} else if (data.cycles.length > 0) {
			setSelectedCycle(data.cycles[0]); // Fallback to the very first cycle
		}
	}, []);

	// Effect 2: Update available messes whenever the selected cycle changes.
	useEffect(() => {
		if (!selectedCycle) return;

		const context = getContextForCycle(selectedCycle);

		if (context && context.availableCategories) {
			setAvailableMenus(context.availableCategories);

			// Validate the currently selected category against the new list.
			const isCurrentCategoryValid = context.availableCategories.some(
				(menu) => menu.value === selectedCategory
			);

			// If the current selection is invalid, auto-correct to the first available option.
			if (!isCurrentCategoryValid && context.availableCategories.length > 0) {
				setSelectedCategory(context.availableCategories[0].value);
			} else if (context.availableCategories.length === 0) {
				setSelectedCategory(""); // Handle case where a cycle has no messes
			}
		} else {
			// Handle case where a cycle might not have a valid version
			setAvailableMenus([]);
			setSelectedCategory("");
		}
	}, [selectedCycle]);

	// Effect 3: Fetch the final menu cards once all dependent selections are stable.
	useEffect(() => {
		// Guard clause: Do not fetch until all selections are valid.
		if (!selectedCycle || !selectedCategory || !selectedWeek || !selectedDay) {
			setMenu(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const context = getContextForCycle(selectedCycle);
		const menuData = context?.menuContent;

		if (!menuData || !menuData[selectedCategory]) {
			setError("Selected mess is not available in this cycle.");
			setMenu(null);
			setLoading(false);
			return;
		}

		const categoryData = menuData[selectedCategory];
		const weekData = categoryData[selectedWeek];
		const dayMenu = weekData?.schedule[selectedDay];

		if (!dayMenu) {
			setMenu(null); // Normal case, e.g., no snacks served on this day.
		} else {
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
			setMenu(finalMenu);
		}
		setLoading(false);
	}, [selectedCycle, selectedCategory, selectedWeek, selectedDay]);

	const handleCycleChange = (startDate) => {
		const newCycle = data.cycles.find((c) => c.startDate === startDate);
		if (newCycle) {
			setSelectedCycle(newCycle);
		}
	};

	const renderContent = () => {
		if (loading) {
			return <p className="text-center text-muted py-10">Loading menu...</p>;
		}
		if (error) {
			return (
				<div
					className="text-center bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl"
					role="alert"
				>
					<strong className="font-bold">Oops! </strong>
					<span className="block sm:inline ml-2">{error}</span>
				</div>
			);
		}
		if (menu) {
			return (
				<div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-x-0 sm:overflow-visible sm:p-0 sm:m-0 lg:grid-cols-4">
					<div className="flex-shrink-0 w-[80%] sm:w-auto">
						<MealCard
							title="Breakfast"
							items={menu.Breakfast}
							commonItems={menu.common.Breakfast}
						/>
					</div>
					<div className="flex-shrink-0 w-[80%] sm:w-auto">
						<MealCard
							title="Lunch"
							items={menu.Lunch}
							commonItems={menu.common.Lunch}
						/>
					</div>
					<div className="flex-shrink-0 w-[80%] sm:w-auto">
						<MealCard
							title="Snacks"
							items={menu.Snacks}
							commonItems={menu.common.Snacks}
						/>
					</div>
					<div className="flex-shrink-0 w-[80%] sm:w-auto">
						<MealCard
							title="Dinner"
							items={menu.Dinner}
							commonItems={menu.common.Dinner}
						/>
					</div>
				</div>
			);
		}
		return (
			<p className="text-center text-muted">No menu items for this meal.</p>
		);
	};

	return (
		<section id="explorer" className="w-full max-w-7xl mx-auto px-4 py-8">
			<div className="text-center mb-8">
				<h2>Explore Full Menu</h2>
				<p className="text-muted text-lg mt-1">
					Select a cycle, mess, and week to view any menu.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
				<SelectDropdown
					label="Select Cycle"
					id="cycle-explorer"
					value={selectedCycle ? selectedCycle.startDate : ""}
					onChange={(e) => handleCycleChange(e.target.value)}
					options={allCycles}
				/>
				<SelectDropdown
					label="Select Mess"
					id="mess-explorer"
					value={selectedCategory}
					onChange={(e) => setSelectedCategory(e.target.value)}
					options={availableMenus}
				/>
				<SelectDropdown
					label="Select Week"
					id="week-explorer"
					value={selectedWeek}
					onChange={(e) => setSelectedWeek(e.target.value)}
					options={WEEKS}
				/>
			</div>

			<div className="flex items-center justify-center gap-2 flex-wrap mb-8">
				{DAY_SHORTCUTS.map((day) => (
					<button
						key={day.value}
						onClick={() => setSelectedDay(day.value)}
						className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg
							${
								selectedDay === day.value
									? "bg-primary text-white shadow"
									: "bg-input-bg text-muted hover:bg-border dark:hover:bg-gray-700"
							}
						`}
					>
						{day.label}
					</button>
				))}
			</div>

			{renderContent()}
		</section>
	);
};

export default MenuExplorer;
