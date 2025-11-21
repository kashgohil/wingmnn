import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { Book, FileText, MessageCircle, Video } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";

export const Route = createFileRoute("/help")({
	component: HelpPage,
	head: () =>
		generateMetadata({
			title: "Help",
			description:
				"Get help with Wingmnn. Find documentation, tutorials, FAQs, and support resources to help you get the most out of the platform.",
			path: "/help",
			keywords: ["help", "documentation", "support", "tutorials", "FAQ"],
		}),
});

function HelpPage() {
	const helpCategories = [
		{
			icon: Book,
			title: "Getting Started",
			description: "Learn the basics and set up your workspace",
			articles: [
				"Creating your first project",
				"Setting up your team",
				"Connecting your email",
				"Basic navigation guide",
			],
			color: "var(--module-mail)",
		},
		{
			icon: FileText,
			title: "Documentation",
			description: "Comprehensive guides and references",
			articles: [
				"API documentation",
				"Integration guides",
				"Workflow automation",
				"Advanced features",
			],
			color: "var(--module-notes)",
		},
		{
			icon: Video,
			title: "Video Tutorials",
			description: "Watch step-by-step video guides",
			articles: [
				"Platform overview",
				"Team collaboration",
				"Project management",
				"Custom workflows",
			],
			color: "var(--module-projects)",
		},
		{
			icon: MessageCircle,
			title: "FAQs",
			description: "Answers to common questions",
			articles: [
				"Billing and pricing",
				"Account management",
				"Security and privacy",
				"Troubleshooting",
			],
			color: "var(--module-messages)",
		},
	];

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
							<span className="text-primary">Help</span> Center
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Find answers, guides, and resources to help you get the most out
							of Wingmnn.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						{helpCategories.map((category) => {
							const Icon = category.icon;
							return (
								<div
									key={category.title}
									className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none"
								>
									<div className="flex items-center gap-4 mb-4">
										<div
											className="w-12 h-12 rounded-none retro-border flex items-center justify-center"
											style={{ backgroundColor: category.color }}
										>
											<Icon className="h-6 w-6 text-foreground" />
										</div>
										<div>
											<h3 className="text-xl font-bold font-mono uppercase">
												{category.title}
											</h3>
											<p className="text-sm text-muted-foreground">
												{category.description}
											</p>
										</div>
									</div>
									<ul className="space-y-2">
										{category.articles.map((article) => (
											<li
												key={article}
												className="flex items-center gap-3 p-2 hover:bg-card/50 rounded-none cursor-pointer transition-colors"
											>
												<div
													className="w-1.5 h-1.5 shrink-0"
													style={{ backgroundColor: category.color }}
												/>
												<span className="text-sm text-foreground">
													{article}
												</span>
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>

					<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none text-center">
						<h3 className="text-xl font-bold font-mono uppercase mb-4">
							Still need help?
						</h3>
						<p className="text-muted-foreground mb-4">
							Our support team is here to help. Reach out and we'll get back to
							you as soon as possible.
						</p>
						<a
							href="/contact"
							className="inline-block text-primary hover:underline font-mono uppercase"
						>
							Contact Support →
						</a>
					</div>
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}
