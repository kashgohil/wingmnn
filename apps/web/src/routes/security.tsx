import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Lock, Server, ShieldCheck } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { SoftRetroGridBackground } from "../components/backgrounds/RetroGridPatterns";

export const Route = createFileRoute("/security")({
	component: SecurityPage,
	head: () =>
		generateMetadata({
			title: "Security",
			description:
				"Enterprise-grade security with end-to-end encryption. Learn how we protect your data with industry-leading security practices and compliance standards.",
			path: "/security",
			keywords: [
				"security",
				"encryption",
				"data protection",
				"privacy",
				"compliance",
			],
		}),
});

function SecurityPage() {
	const securityFeatures = [
		{
			icon: Lock,
			title: "End-to-End Encryption",
			description:
				"All sensitive data is encrypted in transit and at rest. Your communications and files are protected with industry-standard encryption.",
			color: "var(--module-notes)",
		},
		{
			icon: ShieldCheck,
			title: "Access Controls",
			description:
				"Granular permissions and role-based access control ensure that only authorized users can access sensitive information.",
			color: "var(--module-projects)",
		},
		{
			icon: Eye,
			title: "Security Monitoring",
			description:
				"Continuous monitoring and automated alerts help us detect and respond to security threats in real-time.",
			color: "var(--module-feeds)",
		},
		{
			icon: Server,
			title: "Infrastructure Security",
			description:
				"Our infrastructure is built on secure, compliant cloud providers with regular security audits and penetration testing.",
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
							<span className="text-primary">Security</span>
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Your data's security is our top priority. We build security into
							every layer of our platform.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						{securityFeatures.map((feature) => {
							const Icon = feature.icon;
							return (
								<div
									key={feature.title}
									className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none"
								>
									<div className="flex items-center gap-4 mb-4">
										<div
											className="w-12 h-12 rounded-none retro-border flex items-center justify-center"
											style={{ backgroundColor: feature.color }}
										>
											<Icon className="h-6 w-6 text-foreground" />
										</div>
										<h3 className="text-xl font-bold font-mono uppercase">
											{feature.title}
										</h3>
									</div>
									<p className="text-muted-foreground leading-relaxed">
										{feature.description}
									</p>
								</div>
							);
						})}
					</div>

					<div className="retro-border bg-card/80 backdrop-blur-sm p-8 md:p-12 rounded-none">
						<h2 className="text-2xl font-bold font-mono uppercase mb-6">
							Security Practices
						</h2>
						<div className="space-y-4 text-foreground leading-relaxed">
							<p>
								We follow industry best practices for security, including
								regular security audits, penetration testing, and compliance
								with relevant data protection regulations.
							</p>
							<p>
								Our team undergoes regular security training, and we maintain a
								responsible disclosure policy for security researchers. If you
								discover a security vulnerability, please report it to{" "}
								<a
									href="mailto:security@wingmnn.com"
									className="text-primary hover:underline"
								>
									security@wingmnn.com
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}
