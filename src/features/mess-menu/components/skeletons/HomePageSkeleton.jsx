import React from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import TodaysMenuSkeleton from "./TodaysMenuSkeleton";

/**
 * Skeleton loader for the entire HomePage.
 * Displays the TodaysMenu skeleton, divider, and layout structure to eliminate layout shift.
 */
const HomePageSkeleton = () => {
	const skeletonThemeLight = {
		baseColor: "#f9fafb",
		highlightColor: "#e5e7eb",
	};
	const skeletonThemeDark = { baseColor: "#1f2937", highlightColor: "#374151" };
	const isDark =
		typeof document !== "undefined" &&
		document.documentElement.classList.contains("dark");

	return (
		<SkeletonTheme {...(isDark ? skeletonThemeDark : skeletonThemeLight)}>
			<div className="w-full">
				<TodaysMenuSkeleton />
				<div className="w-full max-w-7xl mx-auto px-4">
					<div className="border-t border-border my-4 sm:my-10"></div>
				</div>
			</div>
		</SkeletonTheme>
	);
};

export default HomePageSkeleton;
