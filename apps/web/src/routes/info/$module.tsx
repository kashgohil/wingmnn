import { generateMetadata } from "@/lib/metadata";
import { getModuleBySlug } from "@/lib/modules";
import { createFileRoute, notFound } from "@tanstack/react-router";
import {
	ArrowRight,
	BarChart3,
	Check,
	Clock,
	Link as LinkIcon,
	Shield,
	Sparkles,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { FloatingFooter } from "../../components/FloatingFooter";
import { FloatingHeader } from "../../components/FloatingHeader";
import { SoftRetroGridBackground } from "../../components/backgrounds/RetroGridPatterns";
import { Button } from "../../components/ui/button";

export const Route = createFileRoute("/info/$module")({
	component: ModulePage,
	loader: ({ params }) => {
		const module = getModuleBySlug(params.module);
		if (!module) {
			throw notFound();
		}
		// Return only serializable data (without the icon component)
		return {
			moduleSlug: module.slug,
		};
	},
	head: ({ params }) => {
		const module = getModuleBySlug(params.module);
		if (!module) {
			return generateMetadata({
				title: "Module Not Found",
				description: "The requested module could not be found.",
			});
		}
		const featureKeywords = module.features.map((feature) =>
			typeof feature === "string" ? feature : feature.title,
		);
		return generateMetadata({
			title: `${module.name} Module`,
			description: module.detailedDescription,
			path: `/info/${module.slug}`,
			keywords: [
				module.name.toLowerCase(),
				"module",
				"feature",
				...featureKeywords,
			],
		});
	},
});

function ModulePage() {
	const params = Route.useParams();
	const module = getModuleBySlug(params.module);

	if (!module) {
		throw notFound();
	}

	const Icon = module.icon;

	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
			{/* Soft retro background pattern */}
			<SoftRetroGridBackground className="absolute inset-0 overflow-hidden opacity-40" />

			{/* Soft pastel glow effects */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div
					className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 animate-pulse"
					style={{ backgroundColor: `var(${module.colorVar})` }}
				/>
				<div
					className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 animate-pulse delay-1000"
					style={{ backgroundColor: `var(${module.colorVar})` }}
				/>
			</div>

			<div className="relative mx-auto flex max-w-7xl flex-col gap-24 px-6 pt-6 pb-24">
				<FloatingHeader />

				{/* Hero Section */}
				<section className="space-y-8">
					<div className="flex items-center gap-4">
						<div
							className="p-6 retro-border rounded-none"
							style={{ backgroundColor: `var(${module.colorVar})` }}
						>
							<Icon className="h-12 w-12" />
						</div>
						<div>
							<h1 className="text-5xl md:text-7xl font-bold tracking-tight font-mono uppercase">
								{module.name}
							</h1>
							<p className="text-xl text-muted-foreground mt-2">
								{module.description}
							</p>
						</div>
					</div>

					<div className="max-w-4xl">
						<p className="text-lg leading-relaxed text-foreground">
							{module.detailedDescription}
						</p>
					</div>

					{/* Stats */}
					{module.stats && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{module.stats.map(
								(stat: { label: string; value: string }, idx: number) => (
									<div
										key={idx}
										className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none"
									>
										<div className="text-3xl font-bold font-mono mb-2">
											{stat.value}
										</div>
										<div className="text-sm text-muted-foreground uppercase tracking-wider">
											{stat.label}
										</div>
									</div>
								),
							)}
						</div>
					)}
				</section>

				{/* Visual Mockup Section */}
				<section className="space-y-8">
					<h2 className="text-3xl md:text-5xl font-bold font-mono uppercase tracking-wider">
						See It In Action
					</h2>
					<div className="space-y-6">
						<div
							className="retro-border rounded-none p-12 bg-card/80 backdrop-blur-sm relative overflow-hidden opacity-50"
							style={{
								backgroundColor: `var(${module.colorVar})`,
							}}
						>
							<div className="relative aspect-video bg-background retro-border rounded-none flex items-center justify-center">
								<div className="text-center space-y-4">
									<Icon className="h-24 w-24 mx-auto opacity-20" />
									<p className="text-muted-foreground font-mono uppercase tracking-wider">
										{module.name} Module Preview
									</p>
									<p className="text-sm text-muted-foreground">
										Interactive demo coming soon
									</p>
								</div>
							</div>
						</div>

						{/* Feature Highlights Visual */}
						<div className="grid md:grid-cols-3 gap-6">
							<div className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none text-center space-y-4">
								<div
									className="p-4 retro-border rounded-none inline-flex mx-auto"
									style={{ backgroundColor: `var(${module.colorVar})` }}
								>
									<BarChart3 className="h-8 w-8" />
								</div>
								<h3 className="font-bold font-mono uppercase tracking-wider">
									Analytics
								</h3>
								<p className="text-sm text-muted-foreground">
									Track performance and insights with detailed analytics
								</p>
							</div>
							<div className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none text-center space-y-4">
								<div
									className="p-4 retro-border rounded-none inline-flex mx-auto"
									style={{ backgroundColor: `var(${module.colorVar})` }}
								>
									<Users className="h-8 w-8" />
								</div>
								<h3 className="font-bold font-mono uppercase tracking-wider">
									Collaboration
								</h3>
								<p className="text-sm text-muted-foreground">
									Work together seamlessly with your team
								</p>
							</div>
							<div className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none text-center space-y-4">
								<div
									className="p-4 retro-border rounded-none inline-flex mx-auto"
									style={{ backgroundColor: `var(${module.colorVar})` }}
								>
									<Shield className="h-8 w-8" />
								</div>
								<h3 className="font-bold font-mono uppercase tracking-wider">
									Security
								</h3>
								<p className="text-sm text-muted-foreground">
									Enterprise-grade security and encryption
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Features Grid */}
				<section className="space-y-8">
					<h2 className="text-3xl md:text-5xl font-bold font-mono uppercase tracking-wider">
						Key Features
					</h2>
					<div className="grid md:grid-cols-2 gap-6">
						{module.features.map((feature, idx: number) => {
							const featureTitle =
								typeof feature === "string" ? feature : feature.title;
							const featureDesc =
								typeof feature === "string" ? "" : feature.description;
							return (
								<div
									key={idx}
									className="group relative retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none hover:shadow-lg transition-all duration-300"
								>
									<div
										className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
										style={{
											background: `linear-gradient(to bottom right, var(${module.colorVar})/10, transparent)`,
										}}
									/>
									<div className="relative space-y-3">
										<div className="flex items-start gap-4">
											<div
												className="p-2 rounded-none retro-border shrink-0"
												style={{ backgroundColor: `var(${module.colorVar})` }}
											>
												<Check className="h-5 w-5" />
											</div>
											<div className="flex-1">
												<h3 className="font-semibold text-foreground mb-2 font-mono uppercase tracking-wider">
													{featureTitle}
												</h3>
												{featureDesc && (
													<p className="text-muted-foreground leading-relaxed text-sm">
														{featureDesc}
													</p>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				{/* Use Cases */}
				{module.useCases && (
					<section className="space-y-8">
						<h2 className="text-3xl md:text-5xl font-bold font-mono uppercase tracking-wider">
							Use Cases
						</h2>
						<div className="grid md:grid-cols-1 gap-6">
							{module.useCases.map((useCase, idx: number) => {
								const useCaseTitle =
									typeof useCase === "string" ? useCase : useCase.title;
								const useCaseDesc =
									typeof useCase === "string" ? "" : useCase.description;
								return (
									<div
										key={idx}
										className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none"
									>
										<div className="flex items-start gap-4">
											<div
												className="p-2 rounded-none retro-border shrink-0"
												style={{ backgroundColor: `var(${module.colorVar})` }}
											>
												<Zap className="h-5 w-5" />
											</div>
											<div className="flex-1 space-y-2">
												<h3 className="font-semibold text-foreground font-mono uppercase tracking-wider">
													{useCaseTitle}
												</h3>
												{useCaseDesc && (
													<p className="text-muted-foreground leading-relaxed">
														{useCaseDesc}
													</p>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</section>
				)}

				{/* Benefits */}
				{module.benefits && (
					<section className="space-y-8">
						<h2 className="text-3xl md:text-5xl font-bold font-mono uppercase tracking-wider">
							Benefits
						</h2>
						<div className="grid md:grid-cols-1 gap-6">
							{module.benefits.map((benefit, idx: number) => {
								const benefitTitle =
									typeof benefit === "string" ? benefit : benefit.title;
								const benefitDesc =
									typeof benefit === "string" ? "" : benefit.description;
								return (
									<div
										key={idx}
										className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none"
									>
										<div className="flex items-start gap-4">
											<div
												className="p-2 rounded-none retro-border shrink-0"
												style={{ backgroundColor: `var(${module.colorVar})` }}
											>
												<TrendingUp className="h-5 w-5" />
											</div>
											<div className="flex-1 space-y-2">
												<h3 className="text-foreground leading-relaxed font-semibold font-mono uppercase tracking-wider">
													{benefitTitle}
												</h3>
												{benefitDesc && (
													<p className="text-muted-foreground leading-relaxed">
														{benefitDesc}
													</p>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</section>
				)}

				{/* Integrations */}
				{module.integrations && (
					<section className="space-y-8">
						<h2 className="text-3xl md:text-5xl font-bold font-mono uppercase tracking-wider">
							Integrations
						</h2>
						<div className="flex flex-wrap gap-4">
							{module.integrations.map((integration: string, idx: number) => (
								<div
									key={idx}
									className="retro-border bg-card/80 backdrop-blur-sm px-6 py-3 rounded-none flex items-center gap-2"
								>
									<LinkIcon className="h-4 w-4" />
									<span className="font-mono uppercase text-sm tracking-wider">
										{integration}
									</span>
								</div>
							))}
						</div>
					</section>
				)}

				{/* Visual Presentation Section */}
				<section className="space-y-8">
					<h2 className="text-3xl md:text-5xl font-bold font-mono uppercase tracking-wider">
						How It Works
					</h2>
					{module.workflowSteps ? (
						<div className="grid md:grid-cols-3 gap-8">
							{module.workflowSteps.map((step, idx: number) => {
								const IconComponent =
									step.icon === "Sparkles"
										? Sparkles
										: step.icon === "Zap"
										? Zap
										: TrendingUp;
								return (
									<div
										key={idx}
										className="space-y-4 retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none"
									>
										<div
											className="p-4 retro-border rounded-none inline-flex"
											style={{ backgroundColor: `var(${module.colorVar})` }}
										>
											<IconComponent className="h-8 w-8" />
										</div>
										<h3 className="text-xl font-bold font-mono uppercase tracking-wider">
											{step.title}
										</h3>
										<p className="text-muted-foreground leading-relaxed">
											{step.description}
										</p>
									</div>
								);
							})}
						</div>
					) : (
						<div className="grid md:grid-cols-3 gap-8">
							<div className="space-y-4 retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<div
									className="p-4 retro-border rounded-none inline-flex"
									style={{ backgroundColor: `var(${module.colorVar})` }}
								>
									<Sparkles className="h-8 w-8" />
								</div>
								<h3 className="text-xl font-bold font-mono uppercase tracking-wider">
									Get Started
								</h3>
								<p className="text-muted-foreground">
									Enable the {module.name} module in your workspace settings. It
									takes just a few clicks to get up and running.
								</p>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Clock className="h-4 w-4" />
									<span>2 minutes setup</span>
								</div>
							</div>
							<div className="space-y-4 retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<div
									className="p-4 retro-border rounded-none inline-flex"
									style={{ backgroundColor: `var(${module.colorVar})` }}
								>
									<Zap className="h-8 w-8" />
								</div>
								<h3 className="text-xl font-bold font-mono uppercase tracking-wider">
									Configure
								</h3>
								<p className="text-muted-foreground">
									Customize settings, connect integrations, and set up workflows
									that match your team's needs.
								</p>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<LinkIcon className="h-4 w-4" />
									<span>Connect integrations</span>
								</div>
							</div>
							<div className="space-y-4 retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<div
									className="p-4 retro-border rounded-none inline-flex"
									style={{ backgroundColor: `var(${module.colorVar})` }}
								>
									<TrendingUp className="h-8 w-8" />
								</div>
								<h3 className="text-xl font-bold font-mono uppercase tracking-wider">
									Scale
								</h3>
								<p className="text-muted-foreground">
									Watch your team's productivity grow as you leverage all the
									features and benefits of the {module.name} module.
								</p>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<BarChart3 className="h-4 w-4" />
									<span>Track progress</span>
								</div>
							</div>
						</div>
					)}

					{/* Workflow Diagram */}
					<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none mt-12">
						<h3 className="text-2xl font-bold font-mono uppercase tracking-wider mb-6">
							Workflow
						</h3>
						<div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
							<div className="flex flex-col items-center gap-2">
								<div
									className="p-4 retro-border rounded-none"
									style={{ backgroundColor: `var(${module.colorVar})` }}
								>
									<Sparkles className="h-6 w-6" />
								</div>
								<p className="text-sm font-mono uppercase">Setup</p>
							</div>
							<ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
							<div className="flex flex-col items-center gap-2">
								<div
									className="p-4 retro-border rounded-none"
									style={{ backgroundColor: `var(${module.colorVar})` }}
								>
									<Zap className="h-6 w-6" />
								</div>
								<p className="text-sm font-mono uppercase">Configure</p>
							</div>
							<ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
							<div className="flex flex-col items-center gap-2">
								<div
									className="p-4 retro-border rounded-none"
									style={{ backgroundColor: `var(${module.colorVar})` }}
								>
									<TrendingUp className="h-6 w-6" />
								</div>
								<p className="text-sm font-mono uppercase">Scale</p>
							</div>
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className="retro-border bg-card/80 backdrop-blur-sm p-12 rounded-none text-center space-y-6">
					<h2 className="text-3xl md:text-5xl font-bold font-mono uppercase tracking-wider">
						Ready to Get Started?
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Start using the {module.name} module today and transform how your
						team works.
					</p>
					<div className="flex flex-wrap gap-4 justify-center">
						<Button
							variant="default"
							size="xl"
							asChild
						>
							<a href="/pricing">
								View Pricing
								<ArrowRight className="ml-2 h-4 w-4" />
							</a>
						</Button>
						<Button
							variant="outline"
							size="xl"
							asChild
						>
							<a href="/contact">
								Contact Sales
								<ArrowRight className="ml-2 h-4 w-4" />
							</a>
						</Button>
					</div>
				</section>
			</div>
			<FloatingFooter />
		</div>
	);
}
