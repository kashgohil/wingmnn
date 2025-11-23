import { generateMetadata } from "@/lib/metadata";
import { integrationCategories } from "@/lib/site-data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

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
							<Card
								key={category.title}
								padding="lg"
								className="backdrop-blur-sm bg-card/80 space-y-8 relative overflow-hidden"
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
								<CardHeader className="relative">
									<div className="flex flex-wrap items-center gap-4">
										<div
											className="p-3 retro-border rounded-none"
											style={{ backgroundColor: category.color }}
										>
											<Icon className="h-6 w-6 text-foreground" />
										</div>
										<div>
											<CardDescription className="text-xs font-mono uppercase tracking-[0.4em]">
												Category #{idx + 1}
											</CardDescription>
											<CardTitle className="text-3xl font-bold font-mono uppercase tracking-wider">
												{category.title}
											</CardTitle>
										</div>
									</div>
									<CardDescription className="max-w-2xl">
										{category.description}
									</CardDescription>
								</CardHeader>
								<CardContent className="relative">
									<div className="grid gap-4 md:grid-cols-2">
										{category.integrations.map((integration) => (
											<Card
												key={integration.name}
												padding="md"
												className="bg-card/90"
											>
												<CardContent className="p-0 flex items-center justify-between">
													<div>
														<CardTitle className="font-semibold text-lg">
															{integration.name}
														</CardTitle>
														<CardDescription className="text-sm">
															{integration.description}
														</CardDescription>
													</div>
													<Badge
														variant="secondary"
														className="rounded-none"
													>
														{integration.tag}
													</Badge>
												</CardContent>
											</Card>
										))}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</section>

				<section>
					<Card padding="lg" className="backdrop-blur-sm bg-card/80 text-center">
						<CardHeader>
							<CardTitle className="text-3xl md:text-4xl font-bold">
								Need a specific integration?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="max-w-2xl mx-auto">
								We build enterprise integrations on request and support custom APIs,
								webhooks, and on-prem deployments.
							</CardDescription>
							<div className="flex flex-wrap gap-4 justify-center mt-6">
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
