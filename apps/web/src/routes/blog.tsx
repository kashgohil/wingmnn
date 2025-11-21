import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";

export const Route = createFileRoute("/blog")({
	component: BlogPage,
	head: () =>
		generateMetadata({
			title: "Blog",
			description:
				"Stories, insights, and updates from the Wingmnn team. Learn about product updates, team culture, and the future of work.",
			path: "/blog",
			keywords: ["blog", "news", "updates", "insights", "product updates"],
		}),
});

function BlogPage() {
	const posts = [
		{
			title: "Introducing Wingmnn: The Unified Team Platform",
			excerpt:
				"After months of building, we're excited to share Wingmnn with the world. Learn about our vision for a unified workspace.",
			date: "2024-01-15",
			category: "Product",
			color: "var(--module-mail)",
		},
		{
			title: "Why We Built Wellness Into Our Platform",
			excerpt:
				"Burnout is real, and it's preventable. Here's why we made team wellness a first-class feature, not an afterthought.",
			date: "2024-02-20",
			category: "Culture",
			color: "var(--module-wellness)",
		},
		{
			title: "The Future of Work: Less Tools, More Clarity",
			excerpt:
				"Tool sprawl is killing productivity. We explore why consolidation beats integration, and how unified platforms win.",
			date: "2024-03-10",
			category: "Insights",
			color: "var(--module-projects)",
		},
		{
			title: "Building Security Into Every Layer",
			excerpt:
				"Security isn't a feature—it's a foundation. Learn how we approach encryption, access control, and data protection.",
			date: "2024-04-05",
			category: "Security",
			color: "var(--module-notes)",
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
							<span className="text-primary">Blog</span>
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Stories, insights, and updates from the Wingmnn team.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						{posts.map((post) => (
							<article
								key={post.title}
								className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none hover:shadow-lg transition-all duration-300 cursor-pointer"
							>
								<div className="flex items-center gap-3 mb-4">
									<div
										className="w-3 h-3 shrink-0"
										style={{ backgroundColor: post.color }}
									/>
									<span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
										{post.category}
									</span>
								</div>
								<h2 className="text-xl font-bold mb-3 font-mono uppercase">
									{post.title}
								</h2>
								<p className="text-muted-foreground mb-4 leading-relaxed">
									{post.excerpt}
								</p>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar className="h-4 w-4" />
									<span>
										{new Date(post.date).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								</div>
							</article>
						))}
					</div>
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}
