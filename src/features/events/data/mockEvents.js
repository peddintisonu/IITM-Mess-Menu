/**
 * Mock event data simulating rows from Supabase.
 * Fields: id, title, description, venue, timings, category, display_cutoff
 *
 * display_cutoff is an ISO timestamp — events past this time are "expired".
 */

const now = new Date();
const hours = (h) => {
	const d = new Date(now);
	d.setHours(d.getHours() + h, 0, 0, 0);
	return d.toISOString();
};

const MOCK_EVENTS = [
	{
		id: "evt-1",
		title: "AI Workshop: Intro to Transformers",
		description:
			"Hands-on workshop covering attention mechanisms, tokenizers, and building a small GPT from scratch. Bring your laptops!",
		venue: "CS Department, Room 310",
		timings: "10:00 AM – 1:00 PM",
		category: "Tech",
		display_cutoff: hours(6),
	},
	{
		id: "evt-2",
		title: "Open Mic Night",
		description:
			"Sing, rap, recite poetry, or do stand-up comedy. All forms of expression welcome. Prizes for the best performance!",
		venue: "SAC Auditorium",
		timings: "7:00 PM – 10:00 PM",
		category: "Cultural",
		display_cutoff: hours(12),
	},
	{
		id: "evt-3",
		title: "Blood Donation Camp",
		description:
			"Annual blood donation drive in association with Red Cross. Walk-ins welcome. Refreshments provided after donation.",
		venue: "Hospital Ground Floor",
		timings: "9:00 AM – 4:00 PM",
		category: "Social",
		display_cutoff: hours(-2), // expired
	},
	{
		id: "evt-4",
		title: "Badminton Tournament – Semi Finals",
		description:
			"Watch the intense semi-final matches of the inter-hostel badminton tournament. Come cheer for your hostel!",
		venue: "Indoor Sports Complex",
		timings: "4:00 PM – 7:00 PM",
		category: "Sports",
		display_cutoff: hours(3),
	},
	{
		id: "evt-5",
		title: "Guest Lecture: Climate Change & Policy",
		description:
			"Dr. Ramesh Kumar from IISc will discuss the intersection of climate science and government policy. Q&A session follows.",
		venue: "HSB 236",
		timings: "3:00 PM – 4:30 PM",
		category: "Academic",
		display_cutoff: hours(5),
	},
	{
		id: "evt-6",
		title: "Hackathon Kickoff – 36hr Sprint",
		description:
			"Form teams of 4 and build something amazing in 36 hours. Themes announced at kickoff. Food and caffeine included.",
		venue: "CRC Building, Hall A",
		timings: "6:00 PM onwards",
		category: "Tech",
		display_cutoff: hours(24),
	},
	{
		id: "evt-7",
		title: "Classical Dance Performance",
		description:
			"Bharatanatyam and Kathak performance by students of the dance club. A mesmerizing evening of art and tradition.",
		venue: "OAT (Open Air Theatre)",
		timings: "6:30 PM – 8:00 PM",
		category: "Cultural",
		display_cutoff: hours(-5), // expired
	},
	{
		id: "evt-8",
		title: "NSS Campus Cleanup Drive",
		description:
			"Join the NSS volunteers for a campus-wide cleanup drive. Gloves and bags will be provided. Earn volunteer hours!",
		venue: "Meet at Main Gate",
		timings: "6:00 AM – 8:00 AM",
		category: "Social",
		display_cutoff: hours(-8), // expired
	},
	{
		id: "evt-9",
		title: "Cricket: Staff vs Students",
		description:
			"The legendary annual cricket match between faculty and students. Place your (friendly) bets!",
		venue: "Cricket Ground",
		timings: "4:00 PM – 7:00 PM",
		category: "Sports",
		display_cutoff: hours(8),
	},
	{
		id: "evt-10",
		title: "Research Paper Writing Workshop",
		description:
			"Learn LaTeX formatting, citation management with Zotero, and best practices for writing your first research paper.",
		venue: "Library Seminar Hall",
		timings: "2:00 PM – 5:00 PM",
		category: "Academic",
		display_cutoff: hours(4),
	},
	{
		id: "evt-11",
		title: "Startup Pitch Night",
		description:
			"Student startups pitch their ideas to a panel of investors and mentors. Networking dinner follows.",
		venue: "IC&SR Auditorium",
		timings: "5:00 PM – 8:00 PM",
		category: "Tech",
		display_cutoff: hours(10),
	},
	{
		id: "evt-12",
		title: "Movie Screening: Interstellar",
		description:
			"Free screening of Christopher Nolan's Interstellar on the big screen. Popcorn available at subsidized rates.",
		venue: "SAC Mini Hall",
		timings: "8:00 PM – 11:00 PM",
		category: "Cultural",
		display_cutoff: hours(14),
	},
];

export const EVENT_CATEGORIES = ["All", "Tech", "Cultural", "Sports", "Academic", "Social"];

export default MOCK_EVENTS;
