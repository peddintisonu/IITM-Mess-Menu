import React from "react";
import { ShieldAlert } from "lucide-react";

/**
 * A reusable modal for confirming destructive actions.
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onConfirm: () => void;
 *   title: string;
 *   description: string;
 * }} props
 */
const ConfirmationModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
}) => {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
			onClick={onClose}
		>
			<div
				className="bg-bg border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 relative"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-start gap-4">
					<div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
						<ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
					</div>
					<div className="flex-grow">
						<h2 className="text-lg font-semibold text-fg m-0">{title}</h2>
						<p className="text-sm text-muted mt-1">{description}</p>
					</div>
				</div>

				<div className="mt-6 flex justify-end gap-3">
					<button onClick={onClose} className="btn-secondary">
						Cancel
					</button>
					<button
						onClick={() => {
							onConfirm();
							onClose();
						}}
						// Special styling for a destructive action button
						className="bg-red-600 text-white hover:bg-red-700 active:bg-red-800 inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium transition-colors"
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
