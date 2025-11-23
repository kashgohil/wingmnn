import { generateMetadata } from "@/lib/metadata";
import { getModuleBySlug } from "@/lib/modules";
import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "../components/AuthenticatedLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const Route = createFileRoute("/notes")({
	component: NotesModule,
	head: () =>
		generateMetadata({
			title: "Notes",
			description: "Lightweight docs with AI summaries and backlinks.",
			noindex: true,
		}),
});

function NotesModule() {
	const module = getModuleBySlug("notes");
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
							<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<h2 className="text-2xl font-bold font-mono uppercase tracking-wider mb-4">
									Welcome to {module?.name}
								</h2>
								<p className="text-muted-foreground">
									{module?.detailedDescription}
								</p>
							</div>
						</div>
					</div>
				</div>
			</AuthenticatedLayout>
		</ProtectedRoute>
	);
}
