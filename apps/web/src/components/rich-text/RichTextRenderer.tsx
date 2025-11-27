import { sanitizeRichText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface RichTextRendererProps {
	value?: string | null;
	className?: string;
}

export function RichTextRenderer({ value, className }: RichTextRendererProps) {
	const sanitized = useMemo(() => sanitizeRichText(value), [value]);

	if (!sanitized) {
		return null;
	}

	return (
		<div
			className={cn(
				"text-sm text-muted-foreground [&_p]:mb-2 last:[&_p]:mb-0 [&_ol]:ml-5 [&_ul]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal",
				className,
			)}
			dangerouslySetInnerHTML={{ __html: sanitized }}
		/>
	);
}

