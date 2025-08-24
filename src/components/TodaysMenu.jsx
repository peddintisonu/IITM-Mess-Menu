import React, { useState, useEffect } from "react";
import { getTodaysMenu } from "../api/menuApi";
import {
	getCurrentWeek,
	getCurrentDay,
	getUserCategory,
} from "../utils/weekManager";
import { MENUS } from "../api/constants";
import MealCard from "./MealCard";
import { Settings } from "lucide-react";

const TodaysMenu = () => {
	const [menu, setMenu] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Get context directly from weekManager
	const currentWeek = getCurrentWeek();
	const currentDay = getCurrentDay();
	const currentCategoryValue = getUserCategory();

	useEffect(() => {
		const fetchMenu = async () => {
			setLoading(true);
			setError(null);
			const response = await getTodaysMenu();

			if (response.success) {
				setMenu(response.data);
			} else {
				setMenu(null);
				setError(response.message);
			}
			setLoading(false);
		};

		if (currentCategoryValue && currentWeek) {
			fetchMenu();
		} else {
			setLoading(false);
			setError("Initial setup not complete. Please configure your settings.");
		}
	}, [currentCategoryValue, currentWeek]); // Re-run if category or week changes

	const renderContent = () => {
		if (loading) {
			return (
				<p className="text-center text-muted py-10">Loading today's menu...</p>
			);
		}

		if (error) {
			return (
				<div
					className="text-center bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl"
					role="alert"
				>
					<strong className="font-bold">Oops! </strong>
					<span className="block sm:inline">{error}</span>
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

		return <p className="text-center text-muted">No menu data available.</p>;
	};

	const menuLabel =
		MENUS.find((menu) => menu.value === currentCategoryValue)?.label ||
		"Not Set";

	const formattedDate = new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
	}).format(new Date());

	return (
		<section id="todays-menu" className="w-full max-w-7xl mx-auto px-4 py-8">
			<div className="mb-8">
				{/* Current Settings Display */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm text-muted mb-1">
					<div>
						<span className="font-medium">Your Mess:</span>
						<span className="ml-2 badge badge-primary">{menuLabel}</span>{" "}
						{/* <-- Use the correct label */}
					</div>
					<div className="mt-1 sm:mt-0">
						<span className="font-medium">Current Week:</span>
						<span className="ml-2 badge badge-primary">
							Week {currentWeek || "Not Set"}
						</span>
					</div>
				</div>

				{/* Helper Text */}
				<div className="flex items-center gap-1.5 text-xs text-muted/80">
					<Settings size={12} />
					<span>You can change these in the settings.</span>
				</div>

				{/* Main Heading */}
				<h1 className="mt-4">
					Today's Menu:{" "}
					<span className="text-primary">
						{currentDay}, {formattedDate}
					</span>{" "}
					{/* <-- Use the formatted date */}
				</h1>
			</div>

			{renderContent()}
		</section>
	);
};

export default TodaysMenu;
