import { generateMetadata } from "@/lib/metadata";
import { modules } from "@/lib/modules";
import { modulePricing, pricingPlans } from "@/lib/site-data";
import { createFileRoute } from "@tanstack/react-router";
import { Check, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/pricing")({
	component: PricingPage,
	head: () =>
		generateMetadata({
			title: "Pricing",
			description:
				"Choose the plan that fits your team. All plans include a 14-day free trial. From Starter to Enterprise, find the perfect fit for your organization.",
			path: "/pricing",
			keywords: ["pricing", "plans", "subscription", "enterprise"],
		}),
});

function PricingPage() {
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
							<span className="text-primary">Pricing</span>
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Choose the plan that fits your team. All plans include a 14-day
							free trial.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{pricingPlans.map((plan) => (
							<div
								key={plan.name}
								className={`relative retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none ${
									plan.highlight ? "ring-2 ring-primary" : ""
								}`}
							>
								{plan.highlight && (
									<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-mono uppercase">
										Popular
									</div>
								)}
								<div className="space-y-6">
									<div>
										<h3 className="text-2xl font-bold font-mono uppercase mb-2">
											{plan.name}
										</h3>
										<div className="flex items-baseline gap-2 mb-2">
											<span className="text-4xl font-bold">{plan.price}</span>
											{plan.price !== "Custom" && (
												<span className="text-muted-foreground text-sm">
													{plan.period}
												</span>
											)}
										</div>
										<p className="text-sm text-muted-foreground">
											{plan.description}
										</p>
									</div>
									<ul className="space-y-3">
										{plan.features.map((feature) => (
											<li
												key={feature}
												className="flex items-start gap-3"
											>
												<div
													className="w-5 h-5 rounded-none retro-border flex items-center justify-center shrink-0 mt-0.5"
													style={{ backgroundColor: plan.color }}
												>
													<Check className="h-3 w-3 text-foreground" />
												</div>
												<span className="text-sm text-foreground">
													{feature}
												</span>
											</li>
										))}
									</ul>
									<Button
										className="w-full"
										variant={plan.highlight ? "default" : "outline"}
									>
										{plan.price === "Custom"
											? "Contact Sales"
											: "Start Free Trial"}
									</Button>
								</div>
							</div>
						))}
					</div>

					<ModulePicker />
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}

type ModuleOption = {
	slug: string;
	name: string;
	summary: string;
	price: number;
	colorVar: string;
	icon: LucideIcon;
};

function ModulePicker() {
	const moduleDictionary = useMemo(
		() =>
			Object.fromEntries(
				modules.map((module) => [
					module.slug,
					{
						name: module.name,
						colorVar: module.colorVar,
						icon: module.icon,
					},
				]),
			),
		[],
	);

	const moduleOptions: ModuleOption[] = useMemo(
		() =>
			modulePricing
				.map((pricedModule) => {
					const base = moduleDictionary[pricedModule.slug];

					if (!base) {
						return null;
					}

					return {
						slug: pricedModule.slug,
						name: base.name,
						colorVar: base.colorVar,
						icon: base.icon,
						summary: pricedModule.summary,
						price: pricedModule.monthly,
					};
				})
				.filter((option): option is ModuleOption => Boolean(option)),
		[moduleDictionary],
	);

	const [selectedModules, setSelectedModules] = useState<string[]>(() =>
		moduleOptions.slice(0, 3).map((option) => option.slug),
	);

	const modulePriceMap = useMemo(() => {
		const entries: Record<string, number> = {};
		moduleOptions.forEach((option) => {
			entries[option.slug] = option.price;
		});
		return entries;
	}, [moduleOptions]);

	const selectedDetails = useMemo(
		() =>
			moduleOptions.filter((option) => selectedModules.includes(option.slug)),
		[moduleOptions, selectedModules],
	);

	const totalPrice = selectedModules.reduce(
		(sum, slug) => sum + (modulePriceMap[slug] ?? 0),
		0,
	);

	const formatter = useMemo(
		() =>
			new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
				maximumFractionDigits: 0,
			}),
		[],
	);

	const toggleModule = (slug: string) => {
		setSelectedModules((prev) =>
			prev.includes(slug)
				? prev.filter((item) => item !== slug)
				: [...prev, slug],
		);
	};

	return (
		<div className="space-y-8">
			<div className="text-center max-w-3xl mx-auto space-y-3">
				<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
					Selective pricing
				</p>
				<h2 className="text-4xl font-bold">Build your own workspace</h2>
				<p className="text-muted-foreground">
					Pick only the modules you need right now. See pricing update in
					real-time as you assemble your stack—no surprised invoices.
				</p>
			</div>

			<div className="grid lg:grid-cols-[2fr,1fr] gap-6">
				<div className="grid sm:grid-cols-2 gap-4">
					{moduleOptions.map((option) => {
						const Icon = option.icon;
						const isSelected = selectedModules.includes(option.slug);

						return (
							<button
								key={option.slug}
								type="button"
								onClick={() => toggleModule(option.slug)}
								aria-pressed={isSelected}
								className={`retro-border text-left p-4 flex flex-col gap-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
									isSelected
										? "bg-primary/10 border-primary"
										: "bg-card/60 hover:bg-card"
								}`}
							>
								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										<div
											className="w-12 h-12 retro-border flex items-center justify-center shrink-0"
											style={{
												backgroundColor: `var(${option.colorVar})`,
											}}
										>
											<Icon className="h-5 w-5 text-foreground" />
										</div>
										<div>
											<p className="font-semibold">{option.name}</p>
											<p className="text-xs text-muted-foreground">
												{option.summary}
											</p>
										</div>
									</div>
									<div className="text-lg font-mono">
										{formatter.format(option.price)}
									</div>
								</div>
								<div className="text-xs text-muted-foreground">
									{isSelected
										? "Added to your workspace"
										: "Tap to add this module"}
								</div>
							</button>
						);
					})}
				</div>

				<div className="retro-border bg-card/70 backdrop-blur-sm p-6 space-y-6 sticky top-24 h-fit">
					<div className="space-y-1">
						<p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
							Custom package
						</p>
						<p className="text-4xl font-bold">{formatter.format(totalPrice)}</p>
						<p className="text-sm text-muted-foreground">
							Per user / month • {selectedModules.length} modules
						</p>
					</div>

					<ul className="space-y-3">
						{selectedDetails.length === 0 ? (
							<li className="text-sm text-muted-foreground">
								Choose modules to see them here.
							</li>
						) : (
							selectedDetails.map((module) => (
								<li
									key={module.slug}
									className="flex items-center justify-between text-sm"
								>
									<span>{module.name}</span>
									<span className="font-mono">
										{formatter.format(module.price)}
									</span>
								</li>
							))
						)}
					</ul>

					<Button
						className="w-full"
						size="lg"
					>
						Lock in this bundle
					</Button>
					<p className="text-xs text-muted-foreground">
						Need help modeling? Our team can map modules to your workflows in a
						15-minute call.
					</p>
				</div>
			</div>
		</div>
	);
}
