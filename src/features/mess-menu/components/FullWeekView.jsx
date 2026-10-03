import React, { useState, useEffect } from "react";
import { getContextForCycle } from "../api/menuApi";
import { DAYS } from "../api/constants";
import MealCardSkeleton from "./skeletons/MealCardSkeleton";
import MenuIcon from "./MenuIcon";
import { Circle } from "lucide-react";

/**
 * A compact card that displays the menu for a single day of the week.
 */
const MiniDayCard = ({ dayName, daySchedule }) => {
	const meals = ["Breakfast", "Lunch", "Snacks", "Dinner"];

	return (
		<div className="bg-input-bg border border-border rounded-xl p-4 h-full flex flex-col">
			{/* --- FIX #1 & #2: Corrected Heading and Separator --- */}
			<div className="text-center mb-3 pb-3 border-b border-border/50">
				<h3 className="text-lg font-bold text-primary m-0">{dayName}</h3>
			</div>

			<div className="space-y-3">
				{meals.map((meal, mealIndex) => {
					const items = daySchedule?.[meal];
					if (!items || items.length === 0) return null;

					return (
						<React.Fragment key={meal}>
							{mealIndex > 0 && (
								<div className="border-b border-border/50"></div>
							)}

							<div className="pt-3">
								<div className="flex items-center gap-2 mb-2">
									<MenuIcon meal={meal} className="text-muted w-4 h-4" />
									<h4 className="font-semibold text-fg text-sm">{meal}</h4>
								</div>
								<ul className="text-sm text-muted space-y-1 pl-1">
									{items.map((item, index) => {
										const isSpecialByObject =
											typeof item === "object" &&
											item !== null &&
											item.isSpecial;
										const isSpecialByString =
											typeof item === "string" &&
											item.startsWith("*") &&
											item.endsWith("*");
										const isSpecial = isSpecialByObject || isSpecialByString;

										let itemName = "";
										if (typeof item === "object" && item !== null) {
											itemName = item.name;
										} else if (isSpecialByString) {
											itemName = item.slice(1, -1);
										} else {
											itemName = item;
										}

										if (!itemName) return null;

										return (
											<li key={index} className="flex items-start gap-2">
												<Circle
													size={6}
													fill="currentColor"
													className="text-primary flex-shrink-0 mt-1.5"
												/>
												<div className="flex-grow">
													<span
														className={
															isSpecial ? "font-bold text-primary" : ""
														}
													>
														{itemName}
													</span>
												</div>
											</li>
										);
									})}
								</ul>
							</div>
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
};

/**
 * A component that displays the entire week's menu in a responsive,
 * horizontally scrollable layout on mobile.
 */
const FullWeekView = ({ cycle, category, week }) => {
	const [weekData, setWeekData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!cycle || !category || !week) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		setWeekData(null);

		const context = getContextForCycle(cycle);
		if (!context) {
			setError("Could not load menu data for this cycle.");
			setLoading(false);
			return;
		}

		const categoryData = context.menuContent?.[category];
		const newWeekData = categoryData?.[week];

		if (!newWeekData || !newWeekData.schedule) {
			setError(`No schedule found for Week ${week} in this cycle.`);
		} else {
			setWeekData(newWeekData);
		}
		setLoading(false);
	}, [cycle, category, week]);

	if (loading) {
		return (
			<div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-x-0 sm:overflow-visible sm:p-0 sm:m-0 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div className="flex-shrink-0 w-[80%] sm:w-auto" key={i}>
						<MealCardSkeleton />
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="alert alert-destructive">
				<div className="alert-title">Oops!</div>
				<div className="alert-description">{error}</div>
			</div>
		);
	}

	if (!weekData || !weekData.schedule) {
		return (
			<p className="text-center text-muted">No menu available for this week.</p>
		);
	}

	return (
		<div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-x-0 sm:overflow-visible sm:p-0 sm:m-0 lg:grid-cols-3">
			{DAYS.map((day) => (
				// --- THIS IS THE ONLY LINE TO CHANGE ---
				<div className="flex-shrink-0 w-[90%] sm:w-auto" key={day.value}>
					<MiniDayCard
						dayName={day.value}
						daySchedule={weekData.schedule[day.value]}
					/>
				</div>
			))}
		</div>
	);
};

export default FullWeekView;
