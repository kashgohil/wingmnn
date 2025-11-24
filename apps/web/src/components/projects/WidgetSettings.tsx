/**
 * Widget Settings Dialog
 * Allows users to configure which widgets are visible
 */

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { useWidgetVisibility } from "@/lib/widgets/widget-registry";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface WidgetSettingsProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function WidgetSettings({ open, onOpenChange }: WidgetSettingsProps) {
	const { getWidgetConfig, toggleWidget } = useWidgetVisibility();
	const config = getWidgetConfig();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Widget Settings</DialogTitle>
					<DialogDescription>
						Configure which widgets are visible on your dashboard
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					{config.map((widget) => (
						<div
							key={widget.id}
							className="flex items-center justify-between space-x-2"
						>
							<div className="flex-1">
								<Label htmlFor={widget.id} className="font-medium">
									{widget.name}
								</Label>
								<p className="text-sm text-muted-foreground">
									{widget.description}
								</p>
							</div>
							<Switch
								id={widget.id}
								checked={widget.visible}
								onCheckedChange={() => toggleWidget(widget.id)}
							/>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}

