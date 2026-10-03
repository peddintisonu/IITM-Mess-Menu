import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import MealCardSkeleton from "./MealCardSkeleton"; // Import the meal card skeleton
import { Settings, CalendarDays } from "lucide-react";

/**
 * A skeleton loader for the entire TodaysMenu section.
 * It reserves space for the info bar, heading, and meal cards to prevent layout shift.
 */
const TodaysMenuSkeleton = () => {
	return (
		<section
			id="todays-menu"
			className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8"
		>
			<div className="mb-8">
				{/* Top Info Bar Skeleton */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm text-muted mb-1">
					{/* Skeleton for "Current Cycle" */}
					<div>
						<span className="font-medium">Current Cycle:</span>
						<span className="ml-2">
							<Skeleton width={180} height={20} />
						</span>
					</div>
					{/* Skeleton for "Current Week" */}
					<div className="mt-1 sm:mt-0">
						<span className="font-medium">Current Week:</span>
						<span className="ml-2">
							<Skeleton width={80} height={20} />
						</span>
					</div>
					{/* Skeleton for "Your Mess" */}
					<div className="mt-1 sm:mt-0">
						<span className="font-medium">Your Mess:</span>
						<span className="ml-2">
							<Skeleton width={150} height={20} />
						</span>
					</div>
				</div>
				{/* Helper text does not need a skeleton as it's static */}
				<div className="flex items-center gap-1.5 text-xs text-muted/80">
					<Settings size={12} />
					<span>You can change your mess in the settings.</span>
				</div>

				{/* Main Heading and Interactive Controls Skeleton */}
				<div className="flex items-center gap-4 mt-4">
					<h1 className="m-0">
						<Skeleton width={300} height={36} />
					</h1>
					{/* Placeholder for the Calendar icon */}
					<div className="p-2 rounded-full text-muted">
						<CalendarDays size={24} />
					</div>
				</div>
			</div>

			{/* Grid of Meal Card Skeletons */}
			<div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-x-0 sm:overflow-visible sm:p-0 sm:m-0 lg:grid-cols-4">
				<div className="flex-shrink-0 w-[80%] sm:w-auto">
					<MealCardSkeleton />
				</div>
				<div className="flex-shrink-0 w-[80%] sm:w-auto">
					<MealCardSkeleton />
				</div>
				<div className="flex-shrink-0 w-[80%] sm:w-auto">
					<MealCardSkeleton />
				</div>
				<div className="flex-shrink-0 w-[80%] sm:w-auto">
					<MealCardSkeleton />
				</div>
			</div>
		</section>
	);
};

export default TodaysMenuSkeleton;
