import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

// Lazy-load pages for code splitting.
// The home page (mess menu) loads eagerly since it's the primary use case and needs to work offline.
// Other pages are lazy-loaded to keep the initial bundle small.
const HomePage = lazy(() => import("../pages/HomePage"));
const EventsPage = lazy(() => import("../pages/EventsPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

/**
 * Central routing configuration.
 * All routes are wrapped in MainLayout which provides Navbar + Footer.
 */
const AppRouter = ({ onOpenSettings }) => {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-20 text-muted">
					Loading...
				</div>
			}
		>
			<Routes>
				<Route element={<MainLayout onOpenSettings={onOpenSettings} />}>
					<Route
						path="/"
						element={<HomePage onOpenSettings={onOpenSettings} />}
					/>
					<Route path="/events" element={<EventsPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Route>
			</Routes>
		</Suspense>
	);
};

export default AppRouter;

