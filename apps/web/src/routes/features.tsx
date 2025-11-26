import { generateMetadata } from "@/lib/metadata";
import { modules } from "@/lib/modules";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { SoftRetroGridBackground } from "../components/backgrounds/RetroGridPatterns";

export const Route = createFileRoute("/features")({
	component: FeaturesPage,
	head: () =>
		generateMetadata({
			title: "Features",
			description:
				"Everything you need to streamline your team's workflow, all in one place. Lightning fast, secure by default, and built to scale with you.",
			path: "/features",
			keywords: ["features", "productivity", "security", "scalability"],
		}),
});

function FeaturesPage() {
	const features = [
		{
			icon: Zap,
			title: "Lightning Fast",
			description:
				"Built for speed with modern architecture and optimized performance. Every interaction feels instant.",
			color: "var(--module-mail)",
		},
		{
			icon: ShieldCheck,
			title: "Secure by Default",
			description:
				"Enterprise-grade security with end-to-end encryption. Your data is protected at every layer.",
			color: "var(--module-notes)",
		},
		{
			icon: TrendingUp,
			title: "Scale with You",
			description:
				"Grows from startup to enterprise without missing a beat. Built to handle your team's growth.",
			color: "var(--module-finance)",
		},
		{
			icon: Sparkles,
			title: "AI-Powered",
			description:
				"Intelligent automation that learns from your workflow. Let AI handle the routine, you handle the important.",
			color: "var(--module-feeds)",
		},
	];

	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
			{/* Soft retro background pattern */}
			<SoftRetroGridBackground className="absolute inset-0 overflow-hidden opacity-30" />

			<div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 pt-6 pb-24">
				<FloatingHeader />

				<div className="space-y-12">
					<div className="text-center space-y-4">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							<span className="text-primary">Features</span>
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Everything you need to streamline your team's workflow, all in one
							place.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						{features.map((feature) => {
							const Icon = feature.icon;
							return (
								<div
									key={feature.title}
									className="group relative retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none hover:shadow-lg transition-all duration-300"
								>
									<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="relative">
										<div
											className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-none retro-border text-foreground"
											style={{ backgroundColor: feature.color }}
										>
											<Icon className="h-6 w-6" />
										</div>
										<h3 className="text-xl font-semibold mb-2 font-mono uppercase tracking-wider">
											{feature.title}
										</h3>
										<p className="text-muted-foreground">
											{feature.description}
										</p>
									</div>
								</div>
							);
						})}
					</div>

					<section className="space-y-8">
						<div className="text-center space-y-3">
							<h2 className="text-4xl md:text-5xl font-bold text-foreground">
								Explore the Wingmnn modules
							</h2>
							<p className="text-muted-foreground max-w-2xl mx-auto">
								Every module is a deep, dedicated workspace. Jump in to see what
								it can unlock for your team.
							</p>
						</div>
						<div className="grid gap-6 md:grid-cols-2">
							{modules.map((module) => {
								const Icon = module.icon;
								const featurePreview = module.features
									.slice(0, 3)
									.map((feature) =>
										typeof feature === "string" ? feature : feature.title,
									);

								return (
									<Link
										key={module.slug}
										to="/info/$module"
										params={{ module: module.slug }}
										className="group block retro-border bg-card/80 backdrop-blur-sm p-6 md:p-8 rounded-none hover:shadow-lg transition-all duration-300"
									>
										<div className="flex flex-col gap-6">
											<div className="flex items-center gap-4">
												<div
													className="p-4 retro-border rounded-none"
													style={{ backgroundColor: `var(${module.colorVar})` }}
												>
													<Icon className="h-6 w-6 text-foreground" />
												</div>
												<div>
													<p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
														Module
													</p>
													<h3 className="text-2xl font-bold font-mono uppercase tracking-wider">
														{module.name}
													</h3>
												</div>
											</div>
											<p className="text-muted-foreground leading-relaxed">
												{module.description}
											</p>
											<div className="space-y-2">
												{featurePreview.map((feature) => (
													<div
														key={feature}
														className="flex items-center gap-3 text-sm text-foreground"
													>
														<span
															className="inline-block w-2 h-2 rounded-full"
															style={{
																backgroundColor: `var(${module.colorVar})`,
															}}
														/>
														<span>{feature}</span>
													</div>
												))}
											</div>
											<p className="text-sm font-mono uppercase tracking-[0.4em] text-primary group-hover:tracking-[0.6em] transition-all">
												View details ↗
											</p>
										</div>
									</Link>
								);
							})}
						</div>
					</section>
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}
