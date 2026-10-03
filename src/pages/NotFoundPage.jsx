import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

/**
 * A simple 404 Not Found page with a link back to the home page.
 */
const NotFoundPage = () => {
	return (
		<div className="flex flex-col items-center justify-center py-32 px-4 text-center">
			<h1 className="text-6xl font-bold text-primary mb-4">404</h1>
			<p className="text-xl text-fg mb-2">Page Not Found</p>
			<p className="text-muted mb-8 max-w-md">
				The page you are looking for doesn't exist or has been moved.
			</p>
			<Link
				to="/"
				className="btn-primary inline-flex items-center gap-2"
			>
				<Home size={18} />
				Back to Home
			</Link>
		</div>
	);
};

export default NotFoundPage;
