import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";

export const Route = createFileRoute("/roadmap")({
	component: RoadmapPage,
});

function RoadmapPage() {
	const roadmapItems = [
		{
			quarter: "Q1 2024",
			status: "completed",
			items: [
				"Core platform launch",
				"Unified inbox module",
				"Notes with AI summaries",
				"Basic project management",
			],
			color: "var(--module-mail)",
		},
		{
			quarter: "Q2 2024",
			status: "completed",
			items: [
				"Finance module with invoicing",
				"Calendar integration",
				"Team messaging",
				"File versioning",
			],
			color: "var(--module-notes)",
		},
		{
			quarter: "Q3 2024",
			status: "in-progress",
			items: [
				"Wellness check-ins",
				"Advanced AI features",
				"Custom workflows",
				"Enhanced security",
			],
			color: "var(--module-projects)",
		},
		{
			quarter: "Q4 2024",
			status: "planned",
			items: [
				"Mobile apps (iOS & Android)",
				"Advanced analytics",
				"API for integrations",
				"Enterprise features",
			],
			color: "var(--module-feeds)",
		},
		{
			quarter: "2025",
			status: "planned",
			items: [
				"AI-powered automation",
				"Advanced collaboration tools",
				"Marketplace for extensions",
				"On-premise deployment",
			],
			color: "var(--module-finance)",
		},
	];

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle2 className="h-5 w-5" />;
			case "in-progress":
				return <Clock className="h-5 w-5" />;
			default:
				return <Circle className="h-5 w-5" />;
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
			{/* Soft retro background pattern */}
			<div className="fixed inset-0 -z-10 overflow-hidden opacity-5">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
							linear-gradient(var(--border) 1px, transparent 1px),
							linear-gradient(90deg, var(--border) 1px, transparent 1px)
						`,
						backgroundSize: "40px 40px",
					}}
				/>
			</div>

			<div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 pt-6 pb-24">
				<FloatingHeader />

				<div className="space-y-12">
					<div className="text-center space-y-4">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							<span className="text-primary">Roadmap</span>
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							See what we're building and what's coming next. Your feedback
							shapes our priorities.
						</p>
					</div>

					<div className="space-y-8">
						{roadmapItems.map((item, idx) => (
							<div
								key={item.quarter}
								className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none"
							>
								<div className="flex items-center gap-4 mb-6">
									<div
										className="w-12 h-12 rounded-none retro-border flex items-center justify-center"
										style={{ backgroundColor: item.color }}
									>
										{getStatusIcon(item.status)}
									</div>
									<div>
										<h3 className="text-2xl font-bold font-mono uppercase">
											{item.quarter}
										</h3>
										<p className="text-sm text-muted-foreground capitalize">
											{item.status.replace("-", " ")}
										</p>
									</div>
								</div>
								<ul className="grid md:grid-cols-2 gap-3">
									{item.items.map((roadmapItem) => (
										<li
											key={roadmapItem}
											className="flex items-center gap-3 p-3 retro-border bg-card/50 rounded-none"
										>
											<div
												className="w-2 h-2 shrink-0"
												style={{ backgroundColor: item.color }}
											/>
											<span className="text-sm text-foreground font-mono">
												{roadmapItem}
											</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}
