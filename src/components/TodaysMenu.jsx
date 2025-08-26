import React, { useState, useEffect } from "react";
import { getTodaysMenu, getContextForDate } from "../api/menuApi"; // We can use the simpler API again
import { getCurrentWeek, getUserCategory } from "../utils/weekManager";
import { MENUS } from "../api/constants";
import MealCard from "./MealCard";
import { Settings } from "lucide-react";

/**
 * A component that displays the menu for the current day, along with global
 * info like the current cycle and week.
 */
const TodaysMenu = () => {
	const [menu, setMenu] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// --- Static data for the top info bar (always reflects TODAY) ---
	const userMessPreference = getUserCategory();
	const currentWeek = getCurrentWeek();
	const currentCycle = getContextForDate(new Date())?.cycleName || "Loading...";
	const menuLabel =
		MENUS.find((menu) => menu.value === userMessPreference)?.label || "Not Set";

	useEffect(() => {
		const fetchTodaysMenu = async () => {
			setLoading(true);
			setError(null);

			// Using the simple getTodaysMenu API is sufficient now
			const response = await getTodaysMenu();

			if (response.success) {
				setMenu(response.data);
			} else {
				setError(response.message);
				setMenu(null);
			}
			setLoading(false);
		};

		if (userMessPreference) {
			fetchTodaysMenu();
		} else {
			setLoading(false);
			setError("Please select your mess in the settings to get started.");
		}
	}, [userMessPreference]); // Re-fetch only if the user's preference changes

	const formattedDate = new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(new Date());

	const renderContent = () => {
		if (loading) {
			return <p className="text-center text-muted py-10">Loading menu...</p>;
		}
		if (error) {
			return (
				  <div className="alert alert-destructive" role="alert">
					<div className="alert-title">Oops!</div>
					<div className="alert-description">{error}</div>
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
		<section
			id="todays-menu"
			className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8"
		>
			<div className="mb-8">
				{/* Settings and Global Info Bar */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm text-muted mb-1">
					<div>
						<span className="font-medium">Current Cycle:</span>
						<span className="ml-2 badge badge-primary">{currentCycle}</span>
					</div>
					<div className="mt-2 sm:mt-0">
						<span className="font-medium">Current Week:</span>
						<span className="ml-2 badge badge-primary">Week {currentWeek}</span>
					</div>
					<div className="mt-2 sm:mt-0">
						<span className="font-medium">Your Mess:</span>
						<span className="ml-2 badge badge-primary">{menuLabel}</span>
					</div>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-muted/80">
					<Settings size={12} />
					<span>You can change your mess in the settings.</span>
				</div>

				{/* Main Heading */}
				<div className="flex items-center gap-4 mt-4">
					<h1 className="m-0">
						Today's Menu <span className="text-primary">{formattedDate}</span>
					</h1>
				</div>
			</div>

			{renderContent()}
		</section>
	);
};

export default TodaysMenu;
