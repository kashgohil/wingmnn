import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, MapPin } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { SoftRetroGridBackground } from "../components/backgrounds/RetroGridPatterns";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/careers")({
	component: CareersPage,
	head: () =>
		generateMetadata({
			title: "Careers",
			description:
				"Join us in building the future of team collaboration. We're looking for people who care about craft and impact. Fully remote positions available.",
			path: "/careers",
			keywords: ["careers", "jobs", "hiring", "remote work", "open positions"],
		}),
});

function CareersPage() {
	const openPositions = [
		{
			title: "Senior Full-Stack Engineer",
			department: "Engineering",
			location: "Remote",
			type: "Full-time",
			color: "var(--module-projects)",
		},
		{
			title: "Product Designer",
			department: "Design",
			location: "Remote",
			type: "Full-time",
			color: "var(--module-feeds)",
		},
		{
			title: "Customer Success Manager",
			department: "Customer Success",
			location: "Remote",
			type: "Full-time",
			color: "var(--module-messages)",
		},
		{
			title: "DevOps Engineer",
			department: "Engineering",
			location: "Remote",
			type: "Full-time",
			color: "var(--module-files)",
		},
	];

	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
			{/* Soft retro background pattern */}
			<SoftRetroGridBackground className="absolute inset-0 overflow-hidden opacity-40" />

			<div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 pt-6 pb-24">
				<FloatingHeader />

				<div className="space-y-12">
					<div className="text-center space-y-4">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							<span className="text-primary">Careers</span>
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Join us in building the future of team collaboration. We're
							looking for people who care about craft and impact.
						</p>
					</div>

					<div className="retro-border bg-card/80 backdrop-blur-sm p-8 md:p-12 rounded-none">
						<div className="space-y-6 text-lg text-foreground leading-relaxed">
							<p>
								We're a small, focused team building something big. Every person
								here shapes what Wingmnn becomes. If you're excited about
								unified platforms, thoughtful design, and shipping fast, we'd
								love to hear from you.
							</p>
							<p>
								We're fully remote, value async communication, and believe in
								work-life balance. We offer competitive compensation, equity,
								and the tools you need to do your best work.
							</p>
						</div>
					</div>

					<div>
						<h2 className="text-3xl font-bold mb-8 text-center font-mono uppercase">
							Open Positions
						</h2>
						<div className="space-y-4">
							{openPositions.map((position) => (
								<div
									key={position.title}
									className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none hover:shadow-lg transition-all duration-300"
								>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<div
													className="w-3 h-3 shrink-0"
													style={{ backgroundColor: position.color }}
												/>
												<span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
													{position.department}
												</span>
											</div>
											<h3 className="text-xl font-bold font-mono uppercase mb-2">
												{position.title}
											</h3>
											<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center gap-2">
													<MapPin className="h-4 w-4" />
													<span>{position.location}</span>
												</div>
												<div className="flex items-center gap-2">
													<Briefcase className="h-4 w-4" />
													<span>{position.type}</span>
												</div>
											</div>
										</div>
										<Button variant="outline">Apply</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}
