import React from "react";

const icons = {
	Breakfast: (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M17 8h1a4 4 0 1 1 0 8h-1" />
			<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
			<path d="M6 2v4" />
			<path d="M10 2v4" />
			<path d="M14 2v4" />
		</svg>
	),
	Lunch: (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M3 2v7c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V2" />
			<path d="M5 11v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V11" />
			<path d="M9 11V6" />
			<path d="M15 11V6" />
			<path d="M12 11V6" />
		</svg>
	),
	Snacks: (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m10.3 2.1-7.8 7.8c-.4.4-.4 1 0 1.4l9.2 9.2c.4.4 1 .4 1.4 0l7.8-7.8c.4-.4.4-1 0-1.4l-9.2-9.2c-.2-.2-.5-.3-.7-.3-.2 0-.5.1-.7.3Z" />
			<path d="m7.4 12.6 2.8-2.8" />
			<path d="M13.2 6.8 17 10.6" />
		</svg>
	),
	Dinner: (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 2a7 7 0 1 0 10 9 7 7 0 1 0-10-9Z" />
			<path d="M10.3 21.7a9 9 0 0 0 10.2-10.2" />
			<path d="M12 12a6 6 0 0 0-6 6" />
		</svg>
	),
};

const MenuIcon = ({ meal, className }) => {
	const Icon = icons[meal] || icons["Lunch"]; 
	return <div className={className}>{Icon}</div>;
};

export default MenuIcon;
