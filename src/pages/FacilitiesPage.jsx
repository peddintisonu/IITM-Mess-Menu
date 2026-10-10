import React from "react";
import FacilityList from "../features/facilities/components/FacilityList";

/**
 * Facilities Page — displays campus facilities and their timings.
 */
const FacilitiesPage = () => {
	return (
		<div className="w-full max-w-4xl mx-auto px-4 flex flex-col" style={{ height: "calc(100dvh - 120px)" }}>
			{/* Header */}
			<div className="pt-6 sm:pt-8 pb-4 sm:pb-6">
				<h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">
					Facilities
				</h1>
				<p className="text-sm sm:text-base text-muted mt-1">
					Check what's open on campus
				</p>
			</div>

			{/* Facility List + Filters */}
			<div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border bg-bg overflow-hidden shadow-sm">
				<FacilityList />
			</div>

			{/* Bottom spacer for floating menu */}
			<div className="h-6 sm:h-8 shrink-0" />
		</div>
	);
};

export default FacilitiesPage;
