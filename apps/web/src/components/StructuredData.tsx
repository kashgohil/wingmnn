import * as React from "react";

interface StructuredDataProps {
	data: Record<string, unknown>;
}

/**
 * Component to inject JSON-LD structured data into the page
 * This is a fallback if the head() function doesn't support scripts
 */
export function StructuredData({ data }: StructuredDataProps) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}

