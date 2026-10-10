import React from "react";

/**
 * Formats inline styling markers and HTML tags in menu item text:
 * - *text* or **text** (or <b>/<strong>): Bold / Highlight (font-bold text-primary)
 * - ~text~ or ~~text~~ (or <s>/<del>): Strikethrough (line-through opacity-60)
 * - _text_ (or <i>/<em>): Italic (italic)
 * - +text+ (or <u>/<ins>): Underline (underline underline-offset-2)
 *
 * Supports nested combinations like ~*Cancelled Special*~ or mixed inline text like *Item 1* / ~Item 2~.
 */
const tokenRegex =
	/(~~(?:[^~]+)~~|~(?:[^~]+)~|<del>(?:.*?)<\/del>|<s>(?:.*?)<\/s>|\*\*(?:[^*]+)\*\*|\*(?:[^*]+)\*|<strong>(?:.*?)<\/strong>|<b>(?:.*?)<\/b>|_(?:[^_]+)_|<em>(?:.*?)<\/em>|<i>(?:.*?)<\/i>|\+(?:[^+]+)\+|<ins>(?:.*?)<\/ins>|<u>(?:.*?)<\/u>)/gi;

const parseFormattedItemText = (input, key = "0") => {
	if (typeof input !== "string") return input;
	if (!input) return "";

	const parts = input.split(tokenRegex);
	if (parts.length === 1) {
		return input;
	}

	return parts.map((part, index) => {
		if (!part) return null;
		const childKey = `${key}-${index}`;

		// 1. Strikethrough: ~~text~~, ~text~, <del>text</del>, <s>text</s>
		if (
			(part.startsWith("~~") && part.endsWith("~~") && part.length > 4) ||
			(part.startsWith("~") && part.endsWith("~") && part.length > 2) ||
			(part.toLowerCase().startsWith("<del>") && part.toLowerCase().endsWith("</del>")) ||
			(part.toLowerCase().startsWith("<s>") && part.toLowerCase().endsWith("</s>"))
		) {
			let inner = part;
			if (part.startsWith("~~")) inner = part.slice(2, -2);
			else if (part.startsWith("~")) inner = part.slice(1, -1);
			else if (part.toLowerCase().startsWith("<del>")) inner = part.slice(5, -6);
			else if (part.toLowerCase().startsWith("<s>")) inner = part.slice(3, -4);

			return (
				<del
					key={childKey}
					className="line-through opacity-60 decoration-current"
				>
					{parseFormattedItemText(inner, childKey)}
				</del>
			);
		}

		// 2. Bold / Highlight: **text**, *text*, <strong>text</strong>, <b>text</b>
		if (
			(part.startsWith("**") && part.endsWith("**") && part.length > 4) ||
			(part.startsWith("*") && part.endsWith("*") && part.length > 2) ||
			(part.toLowerCase().startsWith("<strong>") && part.toLowerCase().endsWith("</strong>")) ||
			(part.toLowerCase().startsWith("<b>") && part.toLowerCase().endsWith("</b>"))
		) {
			let inner = part;
			if (part.startsWith("**")) inner = part.slice(2, -2);
			else if (part.startsWith("*")) inner = part.slice(1, -1);
			else if (part.toLowerCase().startsWith("<strong>")) inner = part.slice(8, -9);
			else if (part.toLowerCase().startsWith("<b>")) inner = part.slice(3, -4);

			return (
				<strong key={childKey} className="font-bold text-primary">
					{parseFormattedItemText(inner, childKey)}
				</strong>
			);
		}

		// 3. Italic: _text_, <em>text</em>, <i>text</i>
		if (
			(part.startsWith("_") && part.endsWith("_") && part.length > 2) ||
			(part.toLowerCase().startsWith("<em>") && part.toLowerCase().endsWith("</em>")) ||
			(part.toLowerCase().startsWith("<i>") && part.toLowerCase().endsWith("</i>"))
		) {
			let inner = part;
			if (part.startsWith("_")) inner = part.slice(1, -1);
			else if (part.toLowerCase().startsWith("<em>")) inner = part.slice(4, -5);
			else if (part.toLowerCase().startsWith("<i>")) inner = part.slice(3, -4);

			return (
				<em key={childKey} className="italic">
					{parseFormattedItemText(inner, childKey)}
				</em>
			);
		}

		// 4. Underline: +text+, <ins>text</ins>, <u>text</u>
		if (
			(part.startsWith("+") && part.endsWith("+") && part.length > 2) ||
			(part.toLowerCase().startsWith("<ins>") && part.toLowerCase().endsWith("</ins>")) ||
			(part.toLowerCase().startsWith("<u>") && part.toLowerCase().endsWith("</u>"))
		) {
			let inner = part;
			if (part.startsWith("+")) inner = part.slice(1, -1);
			else if (part.toLowerCase().startsWith("<ins>")) inner = part.slice(5, -6);
			else if (part.toLowerCase().startsWith("<u>")) inner = part.slice(3, -4);

			return (
				<ins key={childKey} className="underline underline-offset-2">
					{parseFormattedItemText(inner, childKey)}
				</ins>
			);
		}

		return part;
	});
};

/**
 * A robust component to render a single menu item with support for:
 * - Bold: *text* or **text**
 * - Strikethrough: ~text~ or ~~text~~
 * - Italic: _text_
 * - Underline: +text+
 * - Object format: { name: "...", isSpecial: true }
 *
 * @param {{ item: string | { name: string, isSpecial: boolean } }} props
 */
const MenuItem = ({ item }) => {
	// --- Case 1: Handle object format ---
	if (
		typeof item === "object" &&
		item !== null &&
		typeof item.name === "string"
	) {
		const formattedName = parseFormattedItemText(item.name);
		if (item.isSpecial) {
			return <span className="font-bold text-primary">{formattedName}</span>;
		}
		return <span>{formattedName}</span>;
	}

	// --- Case 2: Handle string formats ---
	if (typeof item !== "string") {
		return null;
	}

	return <span>{parseFormattedItemText(item)}</span>;
};

export default MenuItem;
