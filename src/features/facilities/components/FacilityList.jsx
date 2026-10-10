import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, MapPin, Tag, ChevronDown, Store, StoreIcon } from "lucide-react";
import facilitiesData from "../data/facilities.json";
import categoryOrder from "../data/categories.json";

const STATUS_TABS = ["All", "Open"];

// Compute categories based on manual order from categories.json, appending any unlisted categories
const dynamicCategories = new Set(facilitiesData.flatMap((f) => f.categories));
const manualOrder = Array.isArray(categoryOrder) ? categoryOrder : [];

const ALL_CATEGORIES = [
	"All",
	...manualOrder.filter((cat) => cat !== "All" && dynamicCategories.has(cat)),
	...[...dynamicCategories].filter((cat) => !manualOrder.includes(cat)),
];

// --- Utilities ---
function isFacilityOpen(schedules, now = new Date()) {
	const currentDay = now.getDay();
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();
	const currentTime = currentHour * 60 + currentMinute;
	
	// Check if open due to a slot that started today
	for (const schedule of schedules) {
		if (schedule.days.includes(currentDay)) {
			for (const slot of schedule.timeSlots) {
				const [openH, openM] = slot.open.split(':').map(Number);
				const [closeH, closeM] = slot.close.split(':').map(Number);
				const openTime = openH * 60 + openM;
				const closeTime = closeH * 60 + closeM;
				
				if (openTime <= closeTime) {
					if (currentTime >= openTime && currentTime <= closeTime) return true;
				} else {
					// Spans midnight. Opened today, closes tomorrow.
					if (currentTime >= openTime) return true;
				}
			}
		}
	}
	
	// Check if open due to a slot that started YESTERDAY and spans midnight
	const yesterdayDay = (currentDay + 6) % 7;
	for (const schedule of schedules) {
		if (schedule.days.includes(yesterdayDay)) {
			for (const slot of schedule.timeSlots) {
				 const [openH, openM] = slot.open.split(':').map(Number);
				 const [closeH, closeM] = slot.close.split(':').map(Number);
				 const openTime = openH * 60 + openM;
				 const closeTime = closeH * 60 + closeM;
				 
				 if (openTime > closeTime) {
					 // Spans midnight. Opened yesterday, closes today.
					 if (currentTime <= closeTime) return true;
				 }
			}
		}
	}
	
	return false;
}

// --- PillTabs Component ---
function PillTabs({ items, active, onChange, className = "", center = false }) {
	const containerRef = useRef(null);
	const [indicatorStyle, setIndicatorStyle] = useState({});
	const isFirstRender = useRef(true);

	useEffect(() => {
		const el = containerRef.current?.querySelector(
			`[data-tab="${active}"]`
		);
		if (el) {
			setIndicatorStyle({
				left: el.offsetLeft,
				width: el.offsetWidth,
			});

			// On user tab selection, keep active tab visible within the horizontal scroll container
			// Avoid window.scrollIntoView to eliminate page-level jumping on load
			if (containerRef.current && !isFirstRender.current) {
				const container = containerRef.current;
				const tabLeft = el.offsetLeft;
				const tabRight = tabLeft + el.offsetWidth;
				const scrollLeft = container.scrollLeft;
				const containerWidth = container.clientWidth;

				if (tabLeft < scrollLeft) {
					container.scrollTo({ left: tabLeft - 16, behavior: "smooth" });
				} else if (tabRight > scrollLeft + containerWidth) {
					container.scrollTo({ left: tabRight - containerWidth + 16, behavior: "smooth" });
				}
			}
			isFirstRender.current = false;
		}
	}, [active]);

	// Mouse wheel / touchpad horizontal scroll support
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const handleWheel = (e) => {
			if (el.scrollWidth > el.clientWidth) {
				if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
					e.preventDefault();
					el.scrollLeft += e.deltaY;
				}
			}
		};

		el.addEventListener("wheel", handleWheel, { passive: false });
		return () => el.removeEventListener("wheel", handleWheel);
	}, []);

	// Mouse drag-to-scroll support for desktop
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		let isDown = false;
		let startX = 0;
		let scrollLeft = 0;
		let hasMoved = false;

		const handleMouseDown = (e) => {
			if (e.button !== 0) return;
			isDown = true;
			hasMoved = false;
			startX = e.pageX - el.offsetLeft;
			scrollLeft = el.scrollLeft;
		};

		const handleMouseLeave = () => {
			isDown = false;
		};

		const handleMouseUp = () => {
			isDown = false;
		};

		const handleMouseMove = (e) => {
			if (!isDown) return;
			e.preventDefault();
			const x = e.pageX - el.offsetLeft;
			const walk = (x - startX) * 1.5;
			if (Math.abs(walk) > 4) {
				hasMoved = true;
			}
			el.scrollLeft = scrollLeft - walk;
		};

		const handleClickCapture = (e) => {
			if (hasMoved) {
				e.stopPropagation();
				e.preventDefault();
			}
		};

		el.addEventListener("mousedown", handleMouseDown);
		el.addEventListener("mouseleave", handleMouseLeave);
		el.addEventListener("mouseup", handleMouseUp);
		el.addEventListener("mousemove", handleMouseMove);
		el.addEventListener("click", handleClickCapture, true);

		return () => {
			el.removeEventListener("mousedown", handleMouseDown);
			el.removeEventListener("mouseleave", handleMouseLeave);
			el.removeEventListener("mouseup", handleMouseUp);
			el.removeEventListener("mousemove", handleMouseMove);
			el.removeEventListener("click", handleClickCapture, true);
		};
	}, []);

	return (
		<div className={`relative w-full ${className}`}>
			<div
				ref={containerRef}
				className={`relative flex items-center gap-1 overflow-x-auto py-1.5 px-2 no-scrollbar cursor-grab active:cursor-grabbing select-none ${
					center ? "justify-center" : "justify-start"
				}`}
			>
				<motion.div
					className="absolute top-1.5 bottom-1.5 rounded-xl bg-primary/15 dark:bg-primary/20 pointer-events-none"
					initial={false}
					animate={indicatorStyle}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					style={{ height: "calc(100% - 12px)" }}
				/>
				{items.map((item) => (
					<button
						key={item}
						data-tab={item}
						onClick={() => onChange(item)}
						className={`relative z-10 shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer
							${
								active === item
									? "text-primary font-semibold"
									: "text-muted hover:text-fg"
							}`}
					>
						{item}
					</button>
				))}
			</div>
		</div>
	);
}

// --- Single Facility Item ---
function FacilityItem({ facility, isExpanded, onToggle, isOpen }) {
	const googleMapsUrl = facility.googleMapsUrl || facility.mapUrl;
	const hasDescription = Boolean(facility.description?.trim());

	return (
		<div
			onClick={onToggle}
			className={`group cursor-pointer rounded-2xl border transition-colors duration-200 overflow-hidden select-none
				${
					!isOpen
						? "border-border/50 bg-input-bg/50 opacity-75"
						: "border-border bg-bg hover:border-primary/30 hover:shadow-sm"
				}`}
		>
			<div
				className={`flex ${
					hasDescription ? "items-start" : "items-center"
				} gap-3 p-4 sm:p-5`}
			>
				<div
					className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
						hasDescription ? "mt-0.5" : ""
					}
					${
						!isOpen
							? "bg-badge-red-bg text-badge-red-fg"
							: "bg-badge-green-bg text-badge-green-fg"
					}`}
				>
					<Store size={18} />
				</div>

				<div className="flex-1 min-w-0">
					<h4 className="text-sm sm:text-base font-semibold leading-tight truncate text-fg">
						{facility.name}
					</h4>
					{hasDescription && (
						<p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-2 mt-1">
							{facility.description}
						</p>
					)}
				</div>

				<div className="flex items-center gap-1 sm:gap-2 shrink-0 self-center">
					{googleMapsUrl && (
						<a
							href={googleMapsUrl}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-input-bg transition-colors"
							title="Open in Google Maps"
							aria-label={`Open ${facility.name} in Google Maps`}
						>
							<MapPin size={18} />
						</a>
					)}
					<motion.div
						animate={{ rotate: isExpanded ? 180 : 0 }}
						transition={{ duration: 0.25 }}
						className="text-muted p-1"
					>
						<ChevronDown size={18} />
					</motion.div>
				</div>
			</div>

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<div className="border-t border-border/60 px-4 sm:px-5 pb-4 sm:pb-5 pt-3 sm:pt-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
								<div className="flex items-start gap-2">
									<MapPin
										size={15}
										className="text-primary mt-0.5 shrink-0"
									/>
									<div>
										<p className="text-xs text-muted font-medium">Location</p>
										<p className="text-sm font-semibold text-fg">
											{facility.location}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-2">
									<Tag
										size={15}
										className="text-primary mt-0.5 shrink-0"
									/>
									<div>
										<p className="text-xs text-muted font-medium">Categories</p>
										<p className="text-sm font-semibold text-fg">
											{facility.categories.join(", ")}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-2 sm:col-span-2 lg:col-span-1">
									<Clock
										size={15}
										className="text-primary mt-0.5 shrink-0"
									/>
									<div>
										<p className="text-xs text-muted font-medium">Weekly Schedule</p>
										<div className="mt-1 space-y-1">
											{facility.schedules.map((schedule, idx) => {
												const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
												const isAllWeek = schedule.days.length === 7;
												const isWeekdays = schedule.days.length === 5 && !schedule.days.includes(0) && !schedule.days.includes(6);
												
												let daysLabel = "";
												if (isAllWeek) daysLabel = "All days";
												else if (isWeekdays) daysLabel = "Mon - Fri";
												else daysLabel = schedule.days.map(d => dayNames[d]).join(", ");

												const timesLabel = schedule.timeSlots
													.map(slot => `${slot.open} - ${slot.close}`)
													.join(", ");

												return (
													<div key={idx} className="text-xs text-fg flex items-baseline gap-1.5">
														<span className="font-medium text-muted shrink-0">{daysLabel}:</span>
														<span>{timesLabel}</span>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							</div>

							{!isOpen && (
								<div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
									<span className="text-badge-red-fg font-medium">
										Currently closed
									</span>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// --- Main List Component ---
export default function FacilityList() {
	const [statusTab, setStatusTab] = useState("All");
	const [activeCategory, setActiveCategory] = useState("All");
	const [expandedId, setExpandedId] = useState(null);
	const [currentTime, setCurrentTime] = useState(new Date());

	// Update time every minute to accurately reflect Open/Closed status
	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 60000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		setExpandedId(null);
	}, [statusTab, activeCategory]);

	// Calculate open status for all facilities once per render based on current time
	const facilitiesWithStatus = facilitiesData.map((f) => ({
		...f,
		isOpen: isFacilityOpen(f.schedules, currentTime),
	}));

	let displayFacilities = facilitiesWithStatus;

	// Filter by Status (Open vs All)
	if (statusTab === "Open") {
		displayFacilities = displayFacilities.filter((f) => f.isOpen);
	}

	// Filter by Category
	if (activeCategory !== "All") {
		displayFacilities = displayFacilities.filter((f) =>
			f.categories.includes(activeCategory)
		);
	}

	const handleToggle = (id) => {
		setExpandedId((prev) => (prev === id ? null : id));
	};

	return (
		<div className="flex flex-col h-full overflow-hidden">
			{/* Top Status Filter */}
			<div className="shrink-0 relative z-20 border-b border-border bg-bg px-2 sm:px-4 py-2 sm:py-3 flex justify-center">
				<PillTabs
					items={STATUS_TABS}
					active={statusTab}
					onChange={setStatusTab}
					center
				/>
			</div>

			{/* Facility Items Scrollable List */}
			<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 sm:px-4 py-3 sm:py-4 relative">
				{displayFacilities.length === 0 ? (
					<div className="text-center py-16 text-muted">
						<StoreIcon
							size={40}
							className="mx-auto mb-3 opacity-40"
						/>
						<p className="font-medium">
							{statusTab === "Open"
								? "No facilities open right now"
								: "No facilities found"}
						</p>
						<p className="text-sm mt-1">
							Try selecting a different category
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						<AnimatePresence initial={false}>
							{displayFacilities.map((facility) => (
								<motion.div
									key={facility.id}
									initial={{ opacity: 0, y: 4 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15, ease: "easeOut" }}
								>
									<FacilityItem
										facility={facility}
										isOpen={facility.isOpen}
										isExpanded={expandedId === facility.id}
										onToggle={() => handleToggle(facility.id)}
									/>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}
			</div>

			{/* Bottom Category Filter */}
			<div className="shrink-0 relative z-20 border-t border-border bg-bg/95 backdrop-blur-md px-2 sm:px-4 py-2 sm:py-3">
				<PillTabs
					items={ALL_CATEGORIES}
					active={activeCategory}
					onChange={setActiveCategory}
				/>
			</div>
		</div>
	);
}
