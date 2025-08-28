import { format } from "date-fns";
import { CalendarDays, RotateCcw, Settings, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { MENUS } from "../api/constants";
import { getContextForDate } from "../api/menuApi";
import {
	getCurrentWeek,
	getUserCategory,
	getWeekForDate,
} from "../utils/weekManager";
import CalendarModal from "./CalendarModal";
import MealCard from "./MealCard";

/**
 * A dynamic component that displays the menu for a selected date.
 * Features a custom calendar modal for date selection.
 */
const TodaysMenu = () => {
	const [menu, setMenu] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeEvent, setActiveEvent] = useState({
		name: null,
		description: null,
	});
	const [fallbackMessage, setFallbackMessage] = useState(null);

	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	const userMessPreference = getUserCategory();
	const currentWeek = getCurrentWeek();
	const currentCycle = getContextForDate(new Date())?.cycleName || "Loading...";
	const menuLabel =
		MENUS.find((menu) => menu.value === userMessPreference)?.label || "Not Set";

	const isViewingToday =
		new Date().toDateString() === selectedDate.toDateString();

	useEffect(() => {
		const fetchMenuForDate = async () => {
			setLoading(true);
			setError(null);
			setFallbackMessage(null);
			setActiveEvent({ name: null, description: null });

			const context = getContextForDate(selectedDate);
			if (!context) {
				setError("No menu data found for the selected date.");
				setMenu(null);
				setLoading(false);
				return;
			}

			if (context.eventName) {
				setActiveEvent({
					name: context.eventName,
					description: context.eventDescription,
				});
			}

			let categoryToDisplay = userMessPreference;
			const isPreferenceValid = context.availableCategories.some(
				(menu) => menu.value === userMessPreference
			);

			if (!isPreferenceValid && context.availableCategories.length > 0) {
				categoryToDisplay = context.availableCategories[0].value;
				const prefLabel =
					MENUS.find((m) => m.value === userMessPreference)?.label ||
					userMessPreference;
				const fallbackLabel = context.availableCategories[0].label;
				setFallbackMessage(
					`Your preferred mess ('${prefLabel}') was not available. Showing '${fallbackLabel}' instead.`
				);
			} else if (context.availableCategories.length === 0) {
				setError("No messes were available on this date.");
				setMenu(null);
				setLoading(false);
				return;
			}

			const menuData = context.menuContent;
			const categoryData = menuData[categoryToDisplay];
			const weekForSelectedDate = getWeekForDate(selectedDate);
			const dayOfWeek = selectedDate.toLocaleString("en-US", {
				weekday: "long",
			});
			const weekData = categoryData[weekForSelectedDate];
			const dayMenu = weekData?.schedule[dayOfWeek];

			if (!dayMenu) {
				setMenu(null);
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
		};

		if (userMessPreference) {
			fetchMenuForDate();
		} else {
			setLoading(false);
			setError("Please select your mess in the settings to get started.");
		}
	}, [selectedDate, userMessPreference]);

	const formattedDate = format(selectedDate, "EEEE, MMMM d");

	const renderContent = () => {
		if (loading) {
			return <p className="text-center text-muted py-10">Loading menu...</p>;
		}
		if (error) {
			return (
				<div className="alert alert-destructive">
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
			<CalendarModal
				isOpen={isCalendarOpen}
				onClose={() => setIsCalendarOpen(false)}
				selectedDate={selectedDate}
				onDateSelect={setSelectedDate}
			/>

			<div className="mb-8">
				{/* Top Info Bar */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm text-muted mb-1">
					<div>
						<span className="font-medium">Current Cycle:</span>
						<span className="ml-2 badge badge-primary">{currentCycle}</span>
					</div>
					<div className="mt-1 sm:mt-0">
						<span className="font-medium">Current Week:</span>
						<span className="ml-2 badge badge-primary">Week {currentWeek}</span>
					</div>
					<div className="mt-1 sm:mt-0">
						<span className="font-medium">Your Mess:</span>
						<span className="ml-2 badge badge-primary">{menuLabel}</span>
					</div>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-muted/80">
					<Settings size={12} />
					<span>You can change your mess in the settings.</span>
				</div>

				{/* Main Heading and Interactive Controls */}
				<div className="flex items-center gap-4 mt-4">
					<h1 className="m-0">
						{isViewingToday ? "Today's Menu" : "Menu for"}{" "}
						<span className="text-primary">{formattedDate}</span>
					</h1>

					{/* Calendar Icon Button to trigger the modal */}
					<button
						onClick={() => setIsCalendarOpen(true)}
						className="p-2 rounded-full text-muted hover:text-primary hover:bg-input-bg transition-colors"
						aria-label="Select a date"
					>
						<CalendarDays size={24} />
					</button>

					{/* "Back to Today" Refresh Button */}
					{!isViewingToday && (
						<button
							onClick={() => setSelectedDate(new Date())}
							className="flex items-center gap-2 text-sm btn-secondary"
							aria-label="Back to today's menu"
						>
							<RotateCcw size={16} />
							<span>Today</span>
						</button>
					)}
				</div>

				{/* Banners for Events and Fallbacks */}
				{activeEvent.name && (
					<div className="event-banner mt-4">
						<div className="event-banner-title">
							<Sparkles size={16} />
							{activeEvent.name}
						</div>
						{activeEvent.description && (
							<div className="event-banner-description">
								{activeEvent.description}
							</div>
						)}
					</div>
				)}
				{fallbackMessage && (
					<div className="alert alert-warning mt-4">
						<div className="alert-description">{fallbackMessage}</div>
					</div>
				)}
			</div>
			{renderContent()}
		</section>
	);
};

export default TodaysMenu;
