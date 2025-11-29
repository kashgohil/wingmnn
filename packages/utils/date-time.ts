export function formatTimeRemaining(dueDate: string): string {
	const now = new Date();
	const due = new Date(dueDate);
	const diffMs = due.getTime() - now.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffHours = Math.floor(
		(diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
	);

	if (diffMs < 0) {
		// Overdue
		const absDays = Math.abs(diffDays);
		if (absDays === 0) {
			return "Overdue today";
		}
		if (absDays === 1) {
			return "Overdue 1 day";
		}
		return `Overdue ${absDays} days`;
	}

	if (diffDays === 0) {
		if (diffHours === 0) {
			return "Due today";
		}
		return `Due in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
	}

	if (diffDays === 1) {
		return "Due tomorrow";
	}

	if (diffDays < 7) {
		return `Due in ${diffDays} days`;
	}

	const weeks = Math.floor(diffDays / 7);
	if (weeks === 1) {
		return "Due in 1 week";
	}
	if (weeks < 4) {
		return `Due in ${weeks} weeks`;
	}

	const months = Math.floor(diffDays / 30);
	if (months === 1) {
		return "Due in 1 month";
	}
	return `Due in ${months} months`;
}
