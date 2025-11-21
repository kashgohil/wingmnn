import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, Target, Users, Zap } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { SoftRetroGridBackground } from "../components/backgrounds/RetroGridPatterns";

export const Route = createFileRoute("/about")({
	component: AboutPage,
	head: () =>
		generateMetadata({
			title: "About",
			description:
				"Learn about Wingmnn's mission to build the operating system for modern teams. We're building a unified platform that brings clarity to chaos.",
			path: "/about",
			keywords: ["about us", "company mission", "team values"],
		}),
});

function AboutPage() {
	const values = [
		{
			icon: Heart,
			title: "Human-Centered",
			description:
				"We build tools that respect your time and attention, putting people first in every decision.",
			color: "var(--module-wellness)",
		},
		{
			icon: Users,
			title: "Team-Focused",
			description:
				"Great work happens when teams are aligned. We design for collaboration, not just individual productivity.",
			color: "var(--module-messages)",
		},
		{
			icon: Target,
			title: "Outcome-Driven",
			description:
				"Every feature connects to real results. We measure success by what you ship, not what we build.",
			color: "var(--module-projects)",
		},
		{
			icon: Zap,
			title: "Fast & Simple",
			description:
				"Complexity is the enemy of clarity. We strip away the noise so you can focus on what matters.",
			color: "var(--module-mail)",
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
							<span className="text-primary">About</span> Wingmnn
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							We're building the operating system for modern teams. One platform
							that brings clarity to chaos.
						</p>
					</div>

					<div className="retro-border bg-card/80 backdrop-blur-sm p-8 md:p-12 rounded-none">
						<div className="space-y-6 text-lg text-foreground leading-relaxed">
							<p>
								Wingmnn was born from frustration. Too many tools, too many
								tabs, too much context switching. We watched teams spend more
								time managing their tools than doing their work.
							</p>
							<p>
								So we built something different. A unified platform that brings
								all your team's essentials together—from email to projects,
								finance to wellness—in one beautifully integrated experience.
							</p>
							<p>
								We believe work should feel good. That's why we design with
								intention, build with care, and never stop listening to what
								teams actually need.
							</p>
						</div>
					</div>

					<div>
						<h2 className="text-3xl font-bold mb-8 text-center font-mono uppercase">
							Our Values
						</h2>
						<div className="grid md:grid-cols-2 gap-6">
							{values.map((value) => {
								const Icon = value.icon;
								return (
									<div
										key={value.title}
										className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none"
									>
										<div className="flex items-center gap-4 mb-4">
											<div
												className="w-12 h-12 rounded-none retro-border flex items-center justify-center"
												style={{ backgroundColor: value.color }}
											>
												<Icon className="h-6 w-6 text-foreground" />
											</div>
											<h3 className="text-xl font-bold font-mono uppercase">
												{value.title}
											</h3>
										</div>
										<p className="text-muted-foreground">{value.description}</p>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}
