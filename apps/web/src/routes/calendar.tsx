import { generateMetadata } from "@/lib/metadata";
import { getModuleBySlug } from "@/lib/modules";
import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "../components/AuthenticatedLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

export const Route = createFileRoute("/calendar")({
	component: CalendarModule,
	head: () =>
		generateMetadata({
			title: "Calendar",
			description:
				"Schedule meetings, track deadlines, and sync team availability.",
			noindex: true,
		}),
});

function CalendarModule() {
	const module = getModuleBySlug("calendar");
	const Icon = module?.icon;

	return (
		<ProtectedRoute>
			<AuthenticatedLayout>
				<div className="min-h-screen bg-background text-foreground p-8">
					<div className="max-w-7xl mx-auto">
						<div className="space-y-8">
							{/* Header */}
							<div className="flex items-center gap-4">
								{Icon && (
									<div
										className="p-6 retro-border rounded-none"
										style={{
											backgroundColor: `var(${module?.colorVar})`,
										}}
									>
										<Icon className="h-12 w-12 text-primary-foreground" />
									</div>
								)}
								<div>
									<h1 className="text-4xl font-bold font-mono uppercase tracking-wider">
										{module?.name}
									</h1>
									<p className="text-muted-foreground mt-2">
										{module?.description}
									</p>
								</div>
							</div>

							{/* Content */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader>
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Welcome to {module?.name}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-base">
										{module?.detailedDescription}
									</CardDescription>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</AuthenticatedLayout>
		</ProtectedRoute>
	);
}
