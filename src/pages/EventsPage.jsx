import React from "react";
import MOCK_EVENTS, { EVENT_CATEGORIES } from "../features/events/data/mockEvents";
import EventList from "../features/events/components/EventList";

/**
 * Events Page — displays upcoming and past campus events.
 * Data will eventually come from Supabase; currently uses mock data.
 */
const EventsPage = () => {
	return (
		<div className="w-full max-w-4xl mx-auto px-4 flex flex-col" style={{ height: "calc(100dvh - 120px)" }}>
			{/* Header */}
			<div className="pt-6 sm:pt-8 pb-4 sm:pb-6">
				<h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">
					Events
				</h1>
				<p className="text-sm sm:text-base text-muted mt-1">
					Stay updated with what's happening on campus
				</p>
			</div>

			{/* Event List + Filters */}
			<div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border bg-bg overflow-hidden shadow-sm">
				<EventList events={MOCK_EVENTS} categories={EVENT_CATEGORIES} />
			</div>

			{/* Bottom spacer for floating menu */}
			<div className="h-6 sm:h-8 shrink-0" />
		</div>
	);
};

export default EventsPage;
