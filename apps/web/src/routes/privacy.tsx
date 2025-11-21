import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
	head: () =>
		generateMetadata({
			title: "Privacy Policy",
			description:
				"Read Wingmnn's privacy policy to understand how we collect, use, and protect your personal information. Your privacy is important to us.",
			path: "/privacy",
			keywords: ["privacy policy", "data privacy", "GDPR", "user rights"],
		}),
});

function PrivacyPage() {
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
							<span className="text-primary">Privacy</span> Policy
						</h1>
						<p className="text-muted-foreground">
							Last updated:{" "}
							{new Date().toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>

					<div className="retro-border bg-card/80 backdrop-blur-sm p-8 md:p-12 rounded-none space-y-8">
						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								1. Information We Collect
							</h2>
							<p className="text-foreground leading-relaxed mb-4">
								We collect information you provide directly to us, such as when
								you create an account, use our services, or contact us for
								support. This includes:
							</p>
							<ul className="list-disc list-inside space-y-2 text-foreground ml-4">
								<li>Account information (name, email address, password)</li>
								<li>
									Content you create, upload, or share through our platform
								</li>
								<li>
									Usage data and analytics about how you interact with our
									services
								</li>
								<li>Device and connection information</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								2. How We Use Your Information
							</h2>
							<p className="text-foreground leading-relaxed mb-4">
								We use the information we collect to:
							</p>
							<ul className="list-disc list-inside space-y-2 text-foreground ml-4">
								<li>Provide, maintain, and improve our services</li>
								<li>Process transactions and send related information</li>
								<li>Send technical notices and support messages</li>
								<li>Respond to your comments and questions</li>
								<li>Monitor and analyze trends and usage</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								3. Data Security
							</h2>
							<p className="text-foreground leading-relaxed">
								We implement appropriate technical and organizational measures
								to protect your personal information. All data is encrypted in
								transit and at rest. We use end-to-end encryption for sensitive
								communications and regularly audit our security practices.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								4. Your Rights
							</h2>
							<p className="text-foreground leading-relaxed mb-4">
								You have the right to:
							</p>
							<ul className="list-disc list-inside space-y-2 text-foreground ml-4">
								<li>Access and receive a copy of your personal data</li>
								<li>Rectify inaccurate or incomplete data</li>
								<li>Request deletion of your personal data</li>
								<li>Object to or restrict processing of your data</li>
								<li>Data portability</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								5. Contact Us
							</h2>
							<p className="text-foreground leading-relaxed">
								If you have questions about this Privacy Policy, please contact
								us at{" "}
								<a
									href="mailto:privacy@wingmnn.com"
									className="text-primary hover:underline"
								>
									privacy@wingmnn.com
								</a>
							</p>
						</section>
					</div>
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}
