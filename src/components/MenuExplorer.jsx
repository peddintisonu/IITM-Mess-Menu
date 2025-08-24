import React, { useState, useEffect } from "react";

// API and utility imports
import { getDayMenu } from "../api/menuApi";
import {
	getCurrentDay,
	getCurrentWeek,
	getUserCategory,
} from "../utils/weekManager";
import { MENUS, WEEKS, DAY_SHORTCUTS } from "../api/constants";

// Component imports
import MealCard from "./MealCard";
import SelectDropdown from "./SelectDropdown";

const MenuExplorer = () => {
	const [menu, setMenu] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// This state is now purely LOCAL to the explorer.
	// It initializes with your saved preferences but doesn't change them.
	const [selectedCategory, setSelectedCategory] = useState(
		() => getUserCategory() || "South_Non_Veg"
	);
	const [selectedWeek, setSelectedWeek] = useState(
		() => getCurrentWeek() || "A"
	);
	const [selectedDay, setSelectedDay] = useState(getCurrentDay);

	useEffect(() => {
		const fetchMenu = async () => {
			setLoading(true);
			setError(null);
			const response = await getDayMenu(
				selectedCategory,
				selectedWeek,
				selectedDay
			);

			if (response.success) {
				setMenu(response.data);
			} else {
				setMenu(null);
				setError(response.message);
			}
			setLoading(false);
		};

		if (selectedCategory && selectedWeek && selectedDay) {
			fetchMenu();
		}
	}, [selectedCategory, selectedWeek, selectedDay]);

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
					<strong className="font-bold">Oops!</strong>
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
			<p className="text-center text-muted">
				No menu data available for this selection.
			</p>
		);
	};

	return (
		<section id="explorer" className="w-full max-w-7xl mx-auto px-4 py-8">
			<div className="text-center mb-8">
				<h2>Explore Full Menu</h2>
				<p className="text-muted text-lg mt-1">
					Select a mess, week, and day to view any menu.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
				<SelectDropdown
					label="Select Mess"
					id="mess-explorer"
					value={selectedCategory}
					onChange={(e) => setSelectedCategory(e.target.value)}
					options={MENUS}
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
