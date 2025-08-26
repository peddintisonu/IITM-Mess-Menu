import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			devOptions: {
				enabled: true, // Enable PWA in development mode
			},
			includeAssets: [
				"/logo.svg",
				"/favicon.ico",
				"/apple-touch-icon.png",
				"/android-chrome-192x192.png",
				"/android-chrome-512x512.png",
			],
		}),
	],
});
