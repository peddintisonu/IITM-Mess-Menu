import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * The global layout wrapper. Renders Navbar, page content (via Outlet), and Footer.
 * This is used as the layout route element in the router.
 */
const MainLayout = ({ onOpenSettings }) => {
	return (
		<div className="min-h-screen bg-bg font-sans text-fg transition-colors">
			<Navbar onOpenSettings={onOpenSettings} />
			<main>
				<Outlet />
			</main>
			<Footer />
		</div>
	);
};

export default MainLayout;
