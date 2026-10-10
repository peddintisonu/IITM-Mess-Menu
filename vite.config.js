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
			registerType: "prompt",
			devOptions: {
				enabled: true, // Enable PWA in development mode also
			},
			includeAssets: [
				"/logo.svg",
				"/favicon.ico",
				"/apple-touch-icon.png",
				"/android-chrome-192x192.png",
				"/android-chrome-512x512.png",
			],
			manifest: {
				name: "DigiMess",
				short_name: "DigiMess",
				description: "A user-friendly web application to view and explore the daily mess menus and campus facilities at IIT Madras.",
				theme_color: "#111827",
				background_color: "#111827",
				display: "standalone",
				start_url: "/",
				scope: "/",
				icons: [
					{
						src: "/android-chrome-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/android-chrome-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/android-chrome-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
		}),
	],
});
