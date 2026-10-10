import React, { useMemo } from "react";
import reactStringReplace from "react-string-replace";

/**
 * Checks whether an href or data-action represents an action to open the feedback modal.
 * Supports: #feedback, #feedbackModal, action:feedback, feedback, or data-action="feedback"
 */
const isFeedbackAction = (href, dataAction) => {
	if (dataAction === "feedback") return true;
	if (!href) return false;
	const normalized = href.trim().toLowerCase();
	return (
		normalized === "#feedback" ||
		normalized === "#feedbackmodal" ||
		normalized === "action:feedback" ||
		normalized === "feedback"
	);
};

const defaultLinkClass =
	"cursor-pointer underline underline-offset-2 font-medium hover:opacity-80 transition-opacity";

/**
 * Parses markdown-style links [text](url) and asterisks *bold* in plain text nodes.
 */
const processTextContent = (text, keyPrefix, onOpenFeedback) => {
	if (!text) return null;

	// 1. Process markdown links: [text](url)
	let elements = reactStringReplace(
		text,
		/(\[[^\]]+\]\([^)]+\))/g,
		(match, i) => {
			const subMatch = match.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
			if (!subMatch) return match;
			const [, label, url] = subMatch;
			const isFeedback = isFeedbackAction(url);

			if (isFeedback) {
				return (
					<a
						key={`${keyPrefix}-md-link-${i}`}
						href="#feedback"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onOpenFeedback?.();
						}}
						className={defaultLinkClass}
					>
						{label}
					</a>
				);
			}

			const isExternal =
				url.startsWith("http://") || url.startsWith("https://");

			return (
				<a
					key={`${keyPrefix}-md-link-${i}`}
					href={url}
					target={isExternal ? "_blank" : undefined}
					rel={isExternal ? "noopener noreferrer" : undefined}
					className={defaultLinkClass}
				>
					{label}
				</a>
			);
		}
	);

	// 2. Process *bold* text
	elements = reactStringReplace(
		elements,
		/\*([^*]+)\*/g,
		(match, i) => (
			<strong key={`${keyPrefix}-bold-${i}`} className="font-semibold">
				{match}
			</strong>
		)
	);

	return elements;
};

/**
 * Recursively converts a DOM node to a safe React element.
 */
const renderDomNode = (node, key, onOpenFeedback) => {
	if (!node) return null;

	// Text Node
	if (node.nodeType === Node.TEXT_NODE) {
		return processTextContent(node.textContent, key, onOpenFeedback);
	}

	// Element Node
	if (node.nodeType === Node.ELEMENT_NODE) {
		const tagName = node.tagName.toLowerCase();

		// Filter out dangerous tags
		if (
			["script", "style", "iframe", "object", "embed", "svg"].includes(tagName)
		) {
			return null;
		}

		// Retrieve classes supporting both 'class' and 'className' (DOMParser creates lowercase attribute names)
		const rawClass =
			node.getAttribute("class") ||
			node.getAttribute("classname") ||
			"";

		const children = Array.from(node.childNodes).map((child, idx) =>
			renderDomNode(child, `${key}-${idx}`, onOpenFeedback)
		);

		if (tagName === "a") {
			const href = node.getAttribute("href") || "";
			const target = node.getAttribute("target");
			const rel = node.getAttribute("rel");
			const dataAction = node.getAttribute("data-action");
			const isFeedback = isFeedbackAction(href, dataAction);

			const finalClass = rawClass
				? `${rawClass} cursor-pointer`
				: defaultLinkClass;

			if (isFeedback) {
				return (
					<a
						key={key}
						href="#feedback"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onOpenFeedback?.();
						}}
						className={finalClass}
					>
						{children.length > 0 ? children : href}
					</a>
				);
			}

			const isExternal =
				href.startsWith("http://") || href.startsWith("https://");

			return (
				<a
					key={key}
					href={href || "#"}
					target={target || (isExternal ? "_blank" : undefined)}
					rel={rel || (isExternal ? "noopener noreferrer" : undefined)}
					className={finalClass}
				>
					{children.length > 0 ? children : href}
				</a>
			);
		}

		if (tagName === "button") {
			const dataAction = node.getAttribute("data-action");
			const isFeedback = isFeedbackAction("", dataAction);

			return (
				<button
					key={key}
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (isFeedback) {
							onOpenFeedback?.();
						}
					}}
					className={
						rawClass
							? `${rawClass} cursor-pointer`
							: defaultLinkClass
					}
				>
					{children}
				</button>
			);
		}

		if (tagName === "strong" || tagName === "b") {
			return (
				<strong key={key} className={`font-semibold ${rawClass}`.trim()}>
					{children}
				</strong>
			);
		}

		if (tagName === "em" || tagName === "i") {
			return (
				<em key={key} className={`italic ${rawClass}`.trim()}>
					{children}
				</em>
			);
		}

		if (tagName === "br") {
			return <br key={key} />;
		}

		if (tagName === "span") {
			return (
				<span key={key} className={rawClass || undefined}>
					{children}
				</span>
			);
		}

		if (tagName === "p") {
			return (
				<p key={key} className={rawClass || undefined}>
					{children}
				</p>
			);
		}

		return React.createElement(
			tagName,
			{ key, className: rawClass || undefined },
			children
		);
	}

	return null;
};

/**
 * EventDescription parses and displays rich descriptions containing HTML tags or markdown links.
 * Clicking a link pointing to '#feedback' or having data-action='feedback' opens the FeedbackModal.
 */
const EventDescription = ({ content, onOpenFeedback }) => {
	const renderedContent = useMemo(() => {
		if (!content || typeof content !== "string") return null;

		if (typeof window === "undefined" || !window.DOMParser) {
			return processTextContent(content, "fallback", onOpenFeedback);
		}

		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(content, "text/html");
			const nodes = Array.from(doc.body.childNodes);
			return nodes.map((node, index) =>
				renderDomNode(node, `event-desc-${index}`, onOpenFeedback)
			);
		} catch (error) {
			console.error("Failed to parse event description:", error);
			return processTextContent(content, "err-fallback", onOpenFeedback);
		}
	}, [content, onOpenFeedback]);

	return <>{renderedContent}</>;
};

export default EventDescription;
