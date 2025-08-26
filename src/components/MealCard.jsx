import MenuIcon from "./MenuIcon";

/**
 * A small component to render a single menu item,
 * with special styling for items marked with asterisks.
 * @param {{ item: string }} props
 */
const MenuItem = ({ item }) => {
	const isSpecial = item.startsWith("*") && item.endsWith("*");

	if (isSpecial) {
		// Remove asterisks and apply special styling
		const specialItem = item.slice(1, -1);
		return <span className="font-bold text-primary">{specialItem}</span>;
	}

	return <span>{item}</span>;
};

const MealCard = ({ title, items, commonItems }) => {
	if (!items || items.length === 0) {
		return (
			<div className="bg-input-bg border border-border rounded-xl p-5 flex flex-col h-full shadow-sm items-center justify-center min-h-[200px]">
				<p className="text-muted">No {title} Today</p>
			</div>
		);
	}

	return (
		<div className="bg-input-bg border border-border rounded-xl p-5 flex flex-col h-full shadow-sm">
			<div className="flex items-center gap-3 mb-4">
				<MenuIcon meal={title} className="text-primary" />
				<h3 className="text-xl font-semibold text-fg m-0">{title}</h3>
			</div>

			<ul className="flex-grow space-y-2 text-muted list-inside">
				{items.map((item, index) => (
					<li key={index} className="flex items-start">
						<span className="text-primary mr-2 mt-1">•</span>
						{/* Use the new MenuItem component for rendering */}
						<MenuItem item={item} />
					</li>
				))}
			</ul>

			{commonItems && (
				<div className="mt-4 pt-4 border-t border-border/50">
					<p className="text-xs font-semibold text-muted uppercase tracking-wider">
						Common Items
					</p>
					<p className="text-sm text-muted/80 mt-1">{commonItems}</p>
				</div>
			)}
		</div>
	);
};

export default MealCard;
