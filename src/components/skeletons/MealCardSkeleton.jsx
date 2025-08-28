import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // Don't forget to import the CSS
import { Circle } from "lucide-react";

/**
 * A skeleton loader component that mimics the layout of a MealCard.
 * This is used to prevent layout shifts while menu data is being fetched.
 */
const MealCardSkeleton = () => {
	return (
		// The main container has the exact same padding, border, and background as the real card.
		<div className="bg-input-bg border border-border rounded-xl p-5 flex flex-col h-full shadow-sm">
			{/* Header Skeleton */}
			<div className="flex items-center gap-3 mb-4">
				{/* Icon Skeleton */}
				<Skeleton circle height={24} width={24} />

				{/* Title and Timing Skeletons */}
				<div>
					<h3 className="text-xl font-semibold text-fg m-0">
						<Skeleton width={100} />
					</h3>
					<p className="text-xs text-muted m-0">
						<Skeleton width={120} />
					</p>
				</div>
			</div>

			{/* Menu Items Skeleton */}
			<ul className="flex-grow space-y-2 text-muted">
				{/* We create a dummy array of 4 items to render skeleton list items */}
				{Array.from({ length: 7 }).map((_, index) => (
					<li key={index} className="flex gap-2 items-center">
						{/* Use a placeholder Circle to maintain spacing, or a Skeleton circle */}
						<Circle
							className="text-border flex-shrink-0 self-center"
							size={6}
							fill="currentColor"
						/>
						<div className="flex-grow">
							<Skeleton />
						</div>
					</li>
				))}
			</ul>

			{/* Common Items Skeleton */}
			<div className="mt-4 pt-4 border-t border-border/50">
				<p className="text-xs font-semibold text-muted uppercase tracking-wider">
					<Skeleton width={90} />
				</p>
				<p className="text-sm text-muted/80 mt-1">
					<Skeleton count={2} />
				</p>
			</div>
		</div>
	);
};

export default MealCardSkeleton;
