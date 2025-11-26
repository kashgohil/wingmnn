import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { SoftRetroGridBackground } from "../components/backgrounds/RetroGridPatterns";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
	ssr: true,
	head: () =>
		generateMetadata({
			title: "Terms of Service",
			description:
				"Read Wingmnn's terms of service to understand the rules and guidelines for using our platform. Updated regularly to reflect our commitment to transparency.",
			path: "/terms",
			keywords: ["terms of service", "terms and conditions", "user agreement"],
		}),
});

function TermsPage() {
	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
			{/* Soft retro background pattern */}
			<SoftRetroGridBackground className="absolute inset-0 overflow-hidden opacity-30" />

			<div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 pt-6 pb-24">
				<FloatingHeader />

				<div className="space-y-12">
					<div className="text-center space-y-4">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							<span className="text-primary">Terms</span> of Service
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
								1. Acceptance of Terms
							</h2>
							<p className="text-foreground leading-relaxed">
								By accessing and using Wingmnn, you accept and agree to be bound
								by the terms and provision of this agreement. If you do not
								agree to these Terms, please do not use our service.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								2. Use License
							</h2>
							<p className="text-foreground leading-relaxed mb-4">
								Permission is granted to temporarily use Wingmnn for personal
								and commercial purposes. This is the grant of a license, not a
								transfer of title, and under this license you may not:
							</p>
							<ul className="list-disc list-inside space-y-2 text-foreground ml-4">
								<li>Modify or copy the materials</li>
								<li>
									Use the materials for any commercial purpose without explicit
									permission
								</li>
								<li>Attempt to decompile or reverse engineer any software</li>
								<li>Remove any copyright or other proprietary notations</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								3. User Accounts
							</h2>
							<p className="text-foreground leading-relaxed">
								You are responsible for maintaining the confidentiality of your
								account and password. You agree to accept responsibility for all
								activities that occur under your account. You must notify us
								immediately of any unauthorized use of your account.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								4. Prohibited Uses
							</h2>
							<p className="text-foreground leading-relaxed mb-4">
								You may not use our service:
							</p>
							<ul className="list-disc list-inside space-y-2 text-foreground ml-4">
								<li>
									In any way that violates any applicable law or regulation
								</li>
								<li>To transmit any malicious code or viruses</li>
								<li>To impersonate or attempt to impersonate another user</li>
								<li>To engage in any automated use of the system</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								5. Termination
							</h2>
							<p className="text-foreground leading-relaxed">
								We may terminate or suspend your account and access to the
								service immediately, without prior notice, for conduct that we
								believe violates these Terms or is harmful to other users, us,
								or third parties.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-bold font-mono uppercase mb-4">
								6. Contact Us
							</h2>
							<p className="text-foreground leading-relaxed">
								If you have questions about these Terms, please contact us at{" "}
								<a
									href="mailto:legal@wingmnn.com"
									className="text-primary hover:underline"
								>
									legal@wingmnn.com
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
