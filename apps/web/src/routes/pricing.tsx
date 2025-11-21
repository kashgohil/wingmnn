import { generateMetadata } from "@/lib/metadata";
import { pricingPlans } from "@/lib/site-data";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
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

					<div className="grid md:grid-cols-3 gap-6">
						{pricingPlans.map((plan) => (
							<div
								key={plan.name}
								className={`relative retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none ${
									plan.highlight ? "ring-2 ring-primary" : ""
								}`}
							>
								{plan.highlight && (
									<div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-mono uppercase">
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
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}
