import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	MapPin,
	Clock,
	Tag,
	ChevronDown,
	CalendarCheck,
	CalendarX2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */

const SPRING = { type: "spring", stiffness: 350, damping: 28 };

const ITEMS_PER_PAGE_MOBILE = 4;
const ITEMS_PER_PAGE_DESKTOP = 6;

const STATUS_TABS = ["Upcoming", "Finished"];

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */

function isExpired(displayCutoff) {
	return new Date(displayCutoff) < new Date();
}

function useItemsPerPage() {
	const [count, setCount] = useState(ITEMS_PER_PAGE_DESKTOP);
	useEffect(() => {
		const update = () =>
			setCount(
				window.innerWidth < 640
					? ITEMS_PER_PAGE_MOBILE
					: ITEMS_PER_PAGE_DESKTOP
			);
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);
	return count;
}

/* ═══════════════════════════════════════════════════════
   PILL TABS — Reusable velocity-style tabs with sliding indicator
   ═══════════════════════════════════════════════════════ */

function PillTabs({ items, active, onChange, className = "" }) {
	const containerRef = useRef(null);
	const [indicatorStyle, setIndicatorStyle] = useState({});

	useEffect(() => {
		const el = containerRef.current?.querySelector(
			`[data-tab="${active}"]`
		);
		if (el) {
			setIndicatorStyle({
				left: el.offsetLeft,
				width: el.offsetWidth,
			});
		}
	}, [active]);

	return (
		<div className={`relative ${className}`}>
			<div
				ref={containerRef}
				className="relative flex items-center justify-center gap-1 overflow-x-auto py-1 px-0.5 no-scrollbar"
			>
				{/* Sliding indicator pill */}
				<motion.div
					className="absolute top-1 bottom-1 rounded-xl bg-primary/15 dark:bg-primary/20"
					initial={false}
					animate={indicatorStyle}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					style={{ height: "calc(100% - 8px)" }}
				/>

				{items.map((item) => (
					<button
						key={item}
						data-tab={item}
						onClick={() => onChange(item)}
						className={`relative z-10 shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200
							${
								active === item
									? "text-primary"
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

/* ═══════════════════════════════════════════════════════
   SINGLE EVENT ITEM — Expandable list item
   ═══════════════════════════════════════════════════════ */

function EventItem({ event, isExpanded, onToggle }) {
	const expired = isExpired(event.display_cutoff);

	return (
		<motion.div
			layout
			onClick={onToggle}
			className={`group cursor-pointer rounded-2xl border transition-colors duration-200 overflow-hidden select-none
				${
					expired
						? "border-border/50 bg-input-bg/50 opacity-75"
						: "border-border bg-bg hover:border-primary/30 hover:shadow-sm"
				}`}
			transition={SPRING}
		>
			{/* ── Collapsed header (always visible) ── */}
			<div className="flex items-start gap-3 p-4 sm:p-5">
				{/* Status icon */}
				<div
					className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl
					${
						expired
							? "bg-badge-red-bg text-badge-red-fg"
							: "bg-badge-green-bg text-badge-green-fg"
					}`}
				>
					{expired ? (
						<CalendarX2 size={18} />
					) : (
						<CalendarCheck size={18} />
					)}
				</div>

				{/* Title + Description */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-0.5">
						<h4
							className={`text-sm sm:text-base font-semibold leading-tight truncate
							${expired ? "text-muted line-through" : "text-fg"}`}
						>
							{event.title}
						</h4>
					</div>
					<p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
						{event.description}
					</p>
				</div>

				{/* Category badge + Expand chevron */}
				<div className="flex items-center gap-2 shrink-0">
					<span className="badge badge-primary hidden sm:inline-flex text-[11px]">
						{event.category}
					</span>
					<motion.div
						animate={{ rotate: isExpanded ? 180 : 0 }}
						transition={{ duration: 0.25 }}
						className="text-muted"
					>
						<ChevronDown size={18} />
					</motion.div>
				</div>
			</div>

			{/* ── Expanded detail panel ── */}
			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{
							height: { type: "spring", stiffness: 300, damping: 28 },
							opacity: { duration: 0.2 },
						}}
						className="overflow-hidden"
					>
						<div className="border-t border-border/60 px-4 sm:px-5 pb-4 sm:pb-5 pt-3 sm:pt-4">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{/* Venue */}
								<div className="flex items-start gap-2">
									<MapPin
										size={15}
										className="text-primary mt-0.5 shrink-0"
									/>
									<div>
										<p className="text-[11px] text-muted uppercase tracking-wider font-medium mb-0.5">
											Venue
										</p>
										<p className="text-sm text-fg font-medium">
											{event.venue}
										</p>
									</div>
								</div>

								{/* Timings */}
								<div className="flex items-start gap-2">
									<Clock
										size={15}
										className="text-primary mt-0.5 shrink-0"
									/>
									<div>
										<p className="text-[11px] text-muted uppercase tracking-wider font-medium mb-0.5">
											Timings
										</p>
										<p className="text-sm text-fg font-medium">
											{event.timings}
										</p>
									</div>
								</div>

								{/* Category (visible on mobile since badge is hidden) */}
								<div className="flex items-start gap-2">
									<Tag
										size={15}
										className="text-primary mt-0.5 shrink-0"
									/>
									<div>
										<p className="text-[11px] text-muted uppercase tracking-wider font-medium mb-0.5">
											Category
										</p>
										<p className="text-sm text-fg font-medium">
											{event.category}
										</p>
									</div>
								</div>
							</div>

							{/* Status indicator */}
							{expired && (
								<div className="mt-3 flex items-center gap-1.5 text-xs text-badge-red-fg">
									<CalendarX2 size={13} />
									<span className="font-medium">
										This event has ended
									</span>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

/* ═══════════════════════════════════════════════════════
   EVENT LIST — Animated list with status + category tabs
   ═══════════════════════════════════════════════════════ */

export default function EventList({ events, categories }) {
	const [statusTab, setStatusTab] = useState("Upcoming");
	const [activeCategory, setActiveCategory] = useState("All");
	const [expandedId, setExpandedId] = useState(null);
	const [visibleCount, setVisibleCount] = useState(0);
	const itemsPerPage = useItemsPerPage();

	// Split events by status, then filter by category
	const displayEvents = useMemo(() => {
		const isUpcoming = statusTab === "Upcoming";

		// Filter by status
		let result = events.filter((e) =>
			isUpcoming ? !isExpired(e.display_cutoff) : isExpired(e.display_cutoff)
		);

		// Filter by category
		if (activeCategory !== "All") {
			result = result.filter((e) => e.category === activeCategory);
		}

		// Sort
		result = [...result].sort((a, b) => {
			if (isUpcoming) {
				// Upcoming: nearest to current time first (soonest cutoff first)
				return new Date(a.display_cutoff) - new Date(b.display_cutoff);
			} else {
				// Finished: most recently finished first (latest cutoff first)
				return new Date(b.display_cutoff) - new Date(a.display_cutoff);
			}
		});

		return result;
	}, [events, statusTab, activeCategory]);

	// Reset pagination when any filter changes
	useEffect(() => {
		setVisibleCount(itemsPerPage);
		setExpandedId(null);
	}, [statusTab, activeCategory, itemsPerPage]);

	const visible = displayEvents.slice(0, visibleCount);
	const hasMore = visibleCount < displayEvents.length;

	const handleToggle = (id) => {
		setExpandedId((prev) => (prev === id ? null : id));
	};

	const loadMore = () => {
		setVisibleCount((prev) =>
			Math.min(prev + itemsPerPage, displayEvents.length)
		);
	};

	return (
		<div className="flex flex-col h-full">
			{/* ── Top status tabs (Upcoming / Finished) ── */}
			<div className="shrink-0 border-b border-border px-2 sm:px-4 pt-2 sm:pt-3 pb-0">
				<PillTabs
					items={STATUS_TABS}
					active={statusTab}
					onChange={setStatusTab}
				/>
			</div>

			{/* ── Scrollable event list ── */}
			<div className="flex-1 overflow-y-auto px-1 py-3 sm:py-4">
				{displayEvents.length === 0 ? (
					<div className="text-center py-16 text-muted">
						<CalendarX2
							size={40}
							className="mx-auto mb-3 opacity-40"
						/>
						<p className="font-medium">
							{statusTab === "Upcoming"
								? "No upcoming events"
								: "No finished events"}
						</p>
						<p className="text-sm mt-1">
							Try selecting a different category
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						<AnimatePresence mode="popLayout" initial={false}>
							{visible.map((event) => (
								<motion.div
									key={event.id}
									layout
									initial={{ opacity: 0, y: -20, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{
										...SPRING,
										layout: SPRING,
									}}
								>
									<EventItem
										event={event}
										isExpanded={expandedId === event.id}
										onToggle={() =>
											handleToggle(event.id)
										}
									/>
								</motion.div>
							))}
						</AnimatePresence>

						{/* Load More */}
						{hasMore && (
							<motion.button
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								onClick={loadMore}
								className="mx-auto mt-2 px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-muted
									hover:text-fg hover:border-primary/30 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
							>
								Show More ({displayEvents.length - visibleCount}{" "}
								remaining)
							</motion.button>
						)}
					</div>
				)}
			</div>

			{/* ── Bottom category filter tabs (centered) ── */}
			<div className="shrink-0 border-t border-border bg-bg/80 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-3">
				<PillTabs
					items={categories}
					active={activeCategory}
					onChange={setActiveCategory}
				/>
			</div>
		</div>
	);
}
