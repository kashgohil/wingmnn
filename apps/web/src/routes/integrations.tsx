import { generateMetadata } from "@/lib/metadata";
import { integrationCategories } from "@/lib/site-data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/integrations")({
	component: IntegrationsPage,
	head: () =>
		generateMetadata({
			title: "Wingmnn Integrations",
			description:
				"Connect Wingmnn with every tool your team already uses. CRM, communication, storage, automation, and more.",
			path: "/integrations",
			keywords: [
				"integrations",
				"crm integrations",
				"wingmnn integrations",
				"slack integration",
				"google workspace integration",
				"microsoft 365 integration",
			],
		}),
});

function IntegrationsPage() {
	const totalIntegrations = integrationCategories.reduce(
		(acc, category) => acc + category.integrations.length,
		0,
	);

	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
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

				<section className="space-y-6 text-center">
					<div className="space-y-4">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							<span className="text-primary">Connect Wingmnn</span> to
							everything.
						</h1>
						<p className="text-lg text-muted-foreground max-w-3xl mx-auto">
							Plug into the tools your team already loves. Sync data, automate
							routines, and keep every workflow in rhythm.
						</p>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-6">
						<div className="retro-border bg-card/80 backdrop-blur-sm px-6 py-4">
							<p className="font-mono uppercase text-xs text-muted-foreground">
								Native Integrations
							</p>
							<p className="text-3xl font-bold">{totalIntegrations}+</p>
						</div>
						<div className="retro-border bg-card/80 backdrop-blur-sm px-6 py-4">
							<p className="font-mono uppercase text-xs text-muted-foreground">
								Automation Reach
							</p>
							<p className="text-3xl font-bold">5,000+</p>
							<p className="text-xs text-muted-foreground mt-1">
								Via Zapier / Make / n8n
							</p>
						</div>
						<div className="retro-border bg-card/80 backdrop-blur-sm px-6 py-4">
							<p className="font-mono uppercase text-xs text-muted-foreground">
								Enterprise Ready
							</p>
							<p className="text-3xl font-bold">SOC 2 • GDPR • SSO</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-4 justify-center">
						<Button
							variant="default"
							size="xl"
							asChild
						>
							<Link
								to="/contact"
								className="inline-flex items-center gap-2"
							>
								Request an integration
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							variant="outline"
							size="xl"
							asChild
						>
							<Link
								to="/security"
								className="inline-flex items-center gap-2"
							>
								View security & compliance
							</Link>
						</Button>
					</div>
				</section>

				<section className="space-y-12">
					{integrationCategories.map((category, idx) => {
						const Icon = category.icon;
						return (
							<div
								key={category.title}
								className="retro-border bg-card/80 backdrop-blur-sm p-8 md:p-10 rounded-none space-y-8 relative overflow-hidden"
							>
								<div
									className="absolute inset-0 opacity-5"
									style={{
										backgroundImage: `
											linear-gradient(var(--border) 1px, transparent 1px),
											linear-gradient(90deg, var(--border) 1px, transparent 1px)
										`,
										backgroundSize: "30px 30px",
									}}
								/>
								<div className="relative space-y-4">
									<div className="flex flex-wrap items-center gap-4">
										<div
											className="p-3 retro-border rounded-none"
											style={{ backgroundColor: category.color }}
										>
											<Icon className="h-6 w-6 text-foreground" />
										</div>
										<div>
											<p className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground">
												Category #{idx + 1}
											</p>
											<h2 className="text-3xl font-bold font-mono uppercase tracking-wider">
												{category.title}
											</h2>
										</div>
									</div>
									<p className="text-muted-foreground max-w-2xl">
										{category.description}
									</p>
								</div>
								<div className="relative grid gap-4 md:grid-cols-2">
									{category.integrations.map((integration) => (
										<div
											key={integration.name}
											className="retro-border bg-card/90 backdrop-blur-sm p-6 rounded-none"
										>
											<div className="flex items-center justify-between">
												<div>
													<h3 className="font-semibold text-lg">
														{integration.name}
													</h3>
													<p className="text-sm text-muted-foreground">
														{integration.description}
													</p>
												</div>
												<Badge
													variant="secondary"
													className="rounded-none"
												>
													{integration.tag}
												</Badge>
											</div>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</section>

				<section className="retro-border bg-card/80 backdrop-blur-sm p-10 rounded-none text-center space-y-4">
					<h2 className="text-3xl md:text-4xl font-bold">
						Need a specific integration?
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						We build enterprise integrations on request and support custom APIs,
						webhooks, and on-prem deployments.
					</p>
					<div className="flex flex-wrap gap-4 justify-center">
						<Button
							variant="default"
							size="xl"
							asChild
						>
							<Link
								to="/contact"
								className="inline-flex items-center gap-2"
							>
								Chat with us
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							variant="outline"
							size="xl"
							asChild
						>
							<Link
								to="/help"
								className="inline-flex items-center gap-2"
							>
								Visit API docs
							</Link>
						</Button>
					</div>
				</section>
			</div>

			<FloatingFooter />
		</div>
	);
}
