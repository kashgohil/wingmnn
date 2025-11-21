import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";

export const Route = createFileRoute("/status")({
	component: StatusPage,
	head: () =>
		generateMetadata({
			title: "Status",
			description:
				"Real-time status and uptime information for Wingmnn services. Check system health, recent incidents, and service availability.",
			path: "/status",
			keywords: [
				"status",
				"uptime",
				"system health",
				"incidents",
				"availability",
			],
		}),
});

function StatusPage() {
	const services = [
		{
			name: "API",
			status: "operational",
			uptime: "99.9%",
			color: "var(--module-mail)",
		},
		{
			name: "Web Application",
			status: "operational",
			uptime: "99.8%",
			color: "var(--module-notes)",
		},
		{
			name: "Database",
			status: "operational",
			uptime: "99.9%",
			color: "var(--module-projects)",
		},
		{
			name: "Email Service",
			status: "operational",
			uptime: "99.7%",
			color: "var(--module-feeds)",
		},
		{
			name: "File Storage",
			status: "operational",
			uptime: "99.9%",
			color: "var(--module-files)",
		},
		{
			name: "Authentication",
			status: "operational",
			uptime: "100%",
			color: "var(--module-messages)",
		},
	];

	const recentIncidents = [
		{
			date: "2024-04-15",
			title: "Scheduled maintenance completed",
			status: "resolved",
			description:
				"All systems are operating normally after scheduled maintenance.",
		},
		{
			date: "2024-03-20",
			title: "API response time improvement",
			status: "resolved",
			description:
				"Optimized API endpoints resulting in 40% faster response times.",
		},
	];

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "operational":
				return <CheckCircle2 className="h-5 w-5 text-green-500" />;
			case "degraded":
				return <AlertCircle className="h-5 w-5 text-yellow-500" />;
			case "down":
				return <XCircle className="h-5 w-5 text-red-500" />;
			default:
				return <Clock className="h-5 w-5 text-gray-500" />;
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
							<span className="text-primary">System</span> Status
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Real-time status of all Wingmnn services and infrastructure.
						</p>
					</div>

					<div className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none">
						<div className="flex items-center gap-4 mb-6">
							<CheckCircle2 className="h-8 w-8 text-green-500" />
							<div>
								<h2 className="text-2xl font-bold font-mono uppercase">
									All Systems Operational
								</h2>
								<p className="text-sm text-muted-foreground">
									All services are running normally.
								</p>
							</div>
						</div>
					</div>

					<div>
						<h2 className="text-3xl font-bold mb-6 font-mono uppercase">
							Services
						</h2>
						<div className="grid md:grid-cols-2 gap-4">
							{services.map((service) => (
								<div
									key={service.name}
									className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none"
								>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-4">
											<div
												className="w-3 h-3 shrink-0"
												style={{ backgroundColor: service.color }}
											/>
											<h3 className="text-lg font-bold font-mono uppercase">
												{service.name}
											</h3>
										</div>
										{getStatusIcon(service.status)}
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground capitalize">
											{service.status}
										</span>
										<span className="text-foreground font-mono">
											{service.uptime} uptime
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					<div>
						<h2 className="text-3xl font-bold mb-6 font-mono uppercase">
							Recent Incidents
						</h2>
						<div className="space-y-4">
							{recentIncidents.map((incident) => (
								<div
									key={incident.date}
									className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none"
								>
									<div className="flex items-start justify-between mb-3">
										<div>
											<h3 className="text-lg font-bold font-mono uppercase mb-1">
												{incident.title}
											</h3>
											<p className="text-sm text-muted-foreground">
												{new Date(incident.date).toLocaleDateString("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
											</p>
										</div>
										<span className="text-xs font-mono uppercase px-3 py-1 bg-green-500/20 text-green-500 rounded-none">
											{incident.status}
										</span>
									</div>
									<p className="text-foreground">{incident.description}</p>
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
