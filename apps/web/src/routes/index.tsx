import { generateMetadata } from "@/lib/metadata";
import { getServerRequest } from "@/lib/server-utils";
import { pricingPlans, spotlightIntegrations } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	ArrowRight,
	Book,
	Calendar,
	Check,
	ChevronDown,
	Code,
	DollarSign,
	FileText,
	Folder,
	FolderKanban,
	Heart,
	Inbox,
	Link as LinkIcon,
	Mail,
	MessageSquare,
	PartyPopper,
	Play,
	Rss,
	ShieldCheck,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import * as React from "react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { SoftRetroGridBackground } from "../components/backgrounds/RetroGridPatterns";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";

export const Route = createFileRoute("/")({
	component: App,
	// Explicitly enable SSR for the homepage
	ssr: true,
	beforeLoad: async ({ location }) => {
		// Only check on homepage
		if (location.pathname !== "/") {
			return;
		}

		// Server-side: Check for refresh_token cookie and redirect if authenticated
		if (typeof window === "undefined") {
			const request = await getServerRequest();

			if (request) {
				// Get cookie header from request
				const cookieHeader =
					request.headers.get("cookie") || request.headers.get("Cookie") || "";

				// Check if refresh_token cookie exists
				const hasRefreshToken = cookieHeader.includes("refresh_token=");

				// If refresh token exists, redirect to dashboard
				// No need to verify with API - just check cookie presence
				// If token is invalid, dashboard will handle it
				if (hasRefreshToken) {
					throw redirect({
						to: "/dashboard",
					});
				}
			}
		}

		// Client-side: Do nothing (no client-side redirect needed)
		// The server already handled the redirect if needed
	},
	head: () =>
		generateMetadata({
			title: "Wingmnn - Human-centered ops stack",
			description:
				"Ship faster rituals with one login. Wingmnn blends comms, docs, money, wellness, and play so you gain clarity without juggling tabs or tooling fluff.",
			path: "/",
			keywords: ["team productivity", "unified inbox", "project management"],
			image: "/logo512.png",
			imageAlt: "Wingmnn - Human-centered ops stack for modern teams",
			imageWidth: 1200,
			imageHeight: 630,
		}),
});

const modules = [
	{
		name: "Mails",
		slug: "mails",
		description: "Unified inbox, priority sorting, follow-up nudges.",
		detailedDescription:
			"Transform your email chaos into organized clarity. Wingmnn's unified inbox brings all your accounts together in one place, with intelligent priority sorting that surfaces what matters most. Never miss a follow-up with smart nudges that remind you when conversations need attention.",
		features: [
			"Unified inbox for all email accounts",
			"AI-powered priority sorting",
			"Smart follow-up reminders",
			"Quick actions and templates",
			"Seamless integration with calendar",
			"Email analytics and insights",
		],
		colorVar: "--module-mail",
		icon: Inbox,
	},
	{
		name: "Notes",
		slug: "notes",
		description: "Lightweight docs with AI summaries and backlinks.",
		detailedDescription:
			"Capture ideas, document decisions, and build knowledge that connects. Our lightweight note-taking system uses AI to generate summaries and automatically creates backlinks between related notes, helping you discover connections you might have missed.",
		features: [
			"Markdown support with rich formatting",
			"AI-generated summaries",
			"Automatic backlink discovery",
			"Real-time collaboration",
			"Version history and snapshots",
			"Tag and folder organization",
		],
		colorVar: "--module-notes",
		icon: FileText,
	},
	{
		name: "Finance",
		slug: "finance",
		description: "Cashflow, invoices, and approvals in one stream.",
		detailedDescription:
			"Keep your financial pulse in one unified view. Track cashflow, manage invoices, and handle approvals all in a single stream. Get real-time insights into your financial health with automated categorization and smart forecasting.",
		features: [
			"Unified financial dashboard",
			"Invoice creation and tracking",
			"Approval workflows",
			"Automated categorization",
			"Cashflow forecasting",
			"Multi-currency support",
		],
		colorVar: "--module-finance",
		icon: DollarSign,
	},
	{
		name: "Feeds",
		slug: "feeds",
		description: "Digest company activity and curated industry intel.",
		detailedDescription:
			"Stay informed without the noise. Our feeds module aggregates company activity, industry news, and curated intelligence into digestible streams. Customize what you see and when, so you're always in the know without feeling overwhelmed.",
		features: [
			"Company activity feed",
			"Curated industry news",
			"Customizable filters",
			"Smart prioritization",
			"Read-it-later functionality",
			"Share and bookmark articles",
		],
		colorVar: "--module-feeds",
		icon: Rss,
	},
	{
		name: "Messages",
		slug: "messages",
		description: "Secure DMs plus async voice & video drops.",
		detailedDescription:
			"Communicate on your own terms. Send secure direct messages, or drop async voice and video notes when typing isn't enough. All conversations are encrypted and searchable, so nothing gets lost in the shuffle.",
		features: [
			"End-to-end encrypted messaging",
			"Async voice and video drops",
			"Threaded conversations",
			"Message search and archives",
			"Reaction and reply features",
			"File and media sharing",
		],
		colorVar: "--module-messages",
		icon: MessageSquare,
	},
	{
		name: "Calendar",
		slug: "calendar",
		description:
			"Schedule meetings, track deadlines, and sync team availability.",
		detailedDescription:
			"Your time, organized. Schedule meetings with smart suggestions based on everyone's availability. Track deadlines and milestones, and sync with external calendars so you never double-book or miss an important event.",
		features: [
			"Smart meeting scheduling",
			"Team availability sync",
			"Deadline and milestone tracking",
			"External calendar integration",
			"Automated reminders",
			"Recurring event management",
		],
		colorVar: "--module-calendar",
		icon: Calendar,
	},
	{
		name: "Wellness",
		slug: "wellness",
		description: "Micro-check-ins, focus playlists, burnout alerts.",
		detailedDescription:
			"Take care of your team's wellbeing. Regular micro-check-ins help you spot burnout before it becomes a problem. Curated focus playlists keep everyone in the zone, and smart alerts ensure work-life balance stays balanced.",
		features: [
			"Daily micro-check-ins",
			"Curated focus playlists",
			"Burnout detection alerts",
			"Wellness insights and trends",
			"Team wellness dashboard",
			"Personal wellness goals",
		],
		colorVar: "--module-wellness",
		icon: Heart,
	},
	{
		name: "Projects",
		slug: "projects",
		description: "Roadmaps, tasks, and rituals tied to outcomes.",
		detailedDescription:
			"Ship faster with clarity. Build roadmaps that connect to real outcomes, break work into actionable tasks, and establish rituals that keep your team aligned. Every project ties back to measurable results.",
		features: [
			"Visual roadmaps",
			"Task management and tracking",
			"Outcome-based planning",
			"Team rituals and standups",
			"Progress analytics",
			"Resource allocation and capacity planning",
		],
		colorVar: "--module-projects",
		icon: FolderKanban,
	},
	{
		name: "Files",
		slug: "files",
		description: "Versioned handoffs with smart organization.",
		detailedDescription:
			"Never lose a file again. Every document is versioned automatically, making it easy to see what changed and when. Smart organization helps you find what you need instantly, and seamless handoffs ensure smooth collaboration.",
		features: [
			"Automatic versioning",
			"Smart file organization",
			"Seamless handoffs",
			"Full-text search",
			"Access control and permissions",
			"Cloud storage integration",
		],
		colorVar: "--module-files",
		icon: Folder,
	},
	{
		name: "Fun",
		slug: "fun",
		description: "Team rituals, async games, surprise celebrations.",
		detailedDescription:
			"Work hard, play together. Build team culture with async games, celebrate wins with surprise celebrations, and establish rituals that bring your team closer. Because the best teams are the ones that enjoy working together.",
		features: [
			"Async team games",
			"Celebration automation",
			"Team rituals and traditions",
			"Virtual water cooler",
			"Team achievements and badges",
			"Custom team challenges",
		],
		colorVar: "--module-fun",
		icon: PartyPopper,
	},
];

function App() {
	// Server-side loader handles redirect for authenticated users
	// No client-side redirect needed - server handles it before HTML is sent
	// Always render landing page content for SEO
	// - Crawlers see full content immediately (no cookies, no redirect)
	// - Authenticated users are redirected server-side (no HTML sent)
	// - Non-authenticated users see the landing page
	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
			{/* Soft retro background pattern */}
			<SoftRetroGridBackground className="absolute inset-0 z-0 overflow-hidden opacity-30" />

			{/* Soft pastel glow effects */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[120px] opacity-10 animate-pulse" />
				<div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent rounded-full blur-[120px] opacity-10 animate-pulse delay-1000" />
			</div>

			<div className="relative mx-auto flex max-w-7xl flex-col gap-24 px-6 pt-36 sm:pt-6 pb-24">
				<FloatingHeader />
				<Hero />
				<Features />
				<ClientLogos />
				<Stats />
				<VideoDemo />
				<UseCases />
				<Modules />
				<IntegrationShowcase />
				<Testimonials />
				<CaseStudies />
				<PricingPreview />
				<ComparisonTable />
				<SocialProofBadges />
				<FAQ />
				<NewsletterSignup />
				<ResourceLinks />
				<FinalCTA />
			</div>
			<FloatingFooter />
		</div>
	);
}

function Hero() {
	return (
		<section className="flex flex-col gap-12 text-center">
			{/* Badge */}
			<Card
				padding="sm"
				className="inline-flex items-center gap-3 mx-auto backdrop-blur-sm bg-card/80"
			>
				<CardContent className="p-0">
					<span className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
						Human-centered ops stack
					</span>
				</CardContent>
			</Card>

			{/* Main heading */}
			<div className="space-y-6 max-w-5xl mx-auto">
				<h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
					<span className="text-foreground">
						keep every part of your team rhythm tidy, from mails to fun.
					</span>
				</h1>
				<p className="text-xl md:text-2xl mx-auto text-muted-foreground max-w-3xl leading-relaxed">
					Ship faster rituals with one login. Wingmnn blends comms, docs, money,
					wellness, and play so you gain clarity without juggling tabs or
					tooling fluff.
				</p>
			</div>

			{/* CTA Buttons */}
			<div className="flex flex-wrap items-center justify-center gap-4">
				<Button
					className="flex items-center gap-2"
					type="button"
					size="lg"
				>
					Start with email
					<ArrowRight className="h-4 w-4" />
				</Button>
				<Button
					className=""
					type="button"
					variant="outline"
					size="lg"
				>
					See platform tour
				</Button>
			</div>
		</section>
	);
}

function Features() {
	return (
		<section>
			<div className="text-center mb-12">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					Everything you need, unified
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					One platform that brings all your tools together seamlessly
				</p>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				{[
					{
						icon: Zap,
						title: "Lightning Fast",
						description:
							"Built for speed with modern architecture and optimized performance",
					},
					{
						icon: ShieldCheck,
						title: "Secure by Default",
						description: "Enterprise-grade security with end-to-end encryption",
					},
					{
						icon: TrendingUp,
						title: "Scale with You",
						description:
							"Grows from startup to enterprise without missing a beat",
					},
				].map((feature) => {
					const Icon = feature.icon;
					return (
						<Card
							key={feature.title}
							padding="lg"
							variant="interactive"
							className="group relative backdrop-blur-sm bg-card/80 hover:shadow-lg"
						>
							<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative">
								<div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-none retro-border bg-primary/10 text-primary">
									<Icon className="h-6 w-6" />
								</div>
								<CardHeader className="p-0 mb-2">
									<CardTitle className="text-xl font-semibold font-mono uppercase tracking-wider">
										{feature.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0">
									<CardDescription>{feature.description}</CardDescription>
								</CardContent>
							</div>
						</Card>
					);
				})}
			</div>
		</section>
	);
}

function ClientLogos() {
	const clients = [
		"Stripe",
		"Vercel",
		"Linear",
		"Notion",
		"Figma",
		"GitHub",
		"Vercel",
		"Supabase",
		"Railway",
		"PlanetScale",
		"Tailwind",
		"Cloudflare",
		"Netlify",
		"Turbo",
		"Prisma",
	];

	const moduleColors = [
		"--module-mail",
		"--module-notes",
		"--module-finance",
		"--module-feeds",
		"--module-messages",
		"--module-calendar",
		"--module-wellness",
		"--module-projects",
		"--module-files",
		"--module-fun",
	];

	return (
		<section className="py-12 overflow-hidden">
			<div className="text-center mb-8">
				<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
					Trusted by innovative teams
				</p>
			</div>
			<div className="relative">
				{/* Gradient overlays for fade effect */}
				<div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
				<div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

				{/* Scrolling marquee */}
				<div className="flex overflow-hidden">
					<div className="flex animate-scroll gap-12">
						{clients.map((client, idx) => {
							const moduleColor = moduleColors[idx % moduleColors.length];
							return (
								<div
									key={`${client}-${idx}`}
									className="shrink-0 flex items-center justify-center px-8 py-4 bg-card/60 backdrop-blur-sm rounded-none min-w-[200px]"
									style={{
										border: `3px solid var(${moduleColor})`,
										boxShadow: `inset -2px -2px 0 rgba(0, 0, 0, 0.15),
											inset 2px 2px 0 rgba(255, 255, 255, 0.9), 
											0 2px 4px rgba(0, 0, 0, 0.15)`,
									}}
								>
									<span className="text-lg font-bold font-mono text-foreground whitespace-nowrap">
										{client}
									</span>
								</div>
							);
						})}
						{/* Duplicate for seamless loop */}
						{clients.map((client, idx) => {
							const moduleColor = moduleColors[idx % moduleColors.length];
							return (
								<div
									key={`${client}-dup-${idx}`}
									className="shrink-0 flex items-center justify-center px-8 py-4 bg-card/60 backdrop-blur-sm rounded-none min-w-[200px]"
									style={{
										border: `3px solid var(${moduleColor})`,
										boxShadow: `inset -2px -2px 0 rgba(0, 0, 0, 0.15),
											inset 2px 2px 0 rgba(255, 255, 255, 0.9), 
											0 2px 4px rgba(0, 0, 0, 0.15)`,
									}}
								>
									<span className="text-lg font-bold font-mono text-foreground whitespace-nowrap">
										{client}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}

function Modules() {
	return (
		<section className="space-y-16">
			<div className="text-center mb-12">
				<div className="inline-flex items-center gap-2 mb-4">
					<h2 className="text-4xl md:text-5xl font-bold text-foreground">
						Every workspace beat, ready for you.
					</h2>
				</div>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					All the tools your team needs, beautifully integrated
				</p>
			</div>
			<div className="space-y-16">
				{modules.map((module, index) => (
					<ModuleSection
						key={module.name}
						module={module}
						index={index}
					/>
				))}
			</div>
		</section>
	);
}

function ModuleSection({
	module,
	index,
}: {
	module: (typeof modules)[number];
	index: number;
}) {
	const Icon = module.icon;
	const moduleColor = `var(${module.colorVar})`;
	const isEven = index % 2 === 0;

	return (
		<Link
			to="/info/$module"
			params={{ module: module.slug }}
			className="relative group block"
		>
			<div
				className={cn(
					"absolute top-0 bottom-0 w-2 opacity-0 group-hover:opacity-100 transition-opacity",
					isEven ? "-left-4" : "-right-4",
				)}
				style={{ backgroundColor: moduleColor }}
			/>
			<div className="relative retro-border group cursor-pointer hover:shadow-lg transition-all duration-300">
				<div
					className="-left-2 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
					style={{ backgroundColor: moduleColor }}
				/>
				<div
					className={`flex flex-col ${
						isEven ? "md:flex-row" : "md:flex-row-reverse"
					}`}
				>
					{/* Icon and Module Name Section with Module Color Background */}
					<div
						className="flex flex-col items-center justify-center p-8 md:p-12 gap-6 min-h-[300px] md:min-h-auto md:w-80"
						style={{ backgroundColor: moduleColor }}
					>
						<div className="flex flex-col items-center gap-6">
							<div className="relative w-32 h-32 flex items-center justify-center retro-border rounded-none bg-card/20">
								<Icon className="h-16 w-16 text-foreground" />
							</div>
							<h3 className="text-3xl md:text-4xl font-bold text-foreground font-mono uppercase tracking-wider text-center">
								{module.name}
							</h3>
						</div>
					</div>

					{/* Module Information Section */}
					<div className="flex-1 bg-card/90 backdrop-blur-sm p-8 md:p-12">
						<div className="space-y-6">
							<div>
								<p className="text-lg text-muted-foreground font-semibold mb-4">
									{module.description}
								</p>
								<p className="text-base text-foreground leading-relaxed">
									{module.detailedDescription}
								</p>
							</div>

							{/* Features Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
								{module.features.map((feature, idx) => (
									<div
										key={idx}
										className="flex items-center gap-3 p-3 retro-border bg-card/50 rounded-none"
									>
										<div
											className="w-2 h-2 shrink-0"
											style={{ backgroundColor: moduleColor }}
										/>
										<span className="text-sm text-foreground font-mono">
											{feature}
										</span>
									</div>
								))}
							</div>

							{/* Learn More Link */}
							<div className="pt-6">
								<div className="inline-flex items-center gap-2 text-foreground font-mono uppercase tracking-wider text-sm hover:gap-4 transition-all duration-300">
									<span>Learn More</span>
									<ArrowRight className="h-4 w-4" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

function Stats() {
	const stats = [
		{
			value: "10K+",
			label: "Active Teams",
			icon: Users,
			color: "var(--module-projects)",
		},
		{
			value: "2M+",
			label: "Emails Processed",
			icon: Inbox,
			color: "var(--module-mail)",
		},
		{
			value: "50K+",
			label: "Tasks Completed",
			icon: FolderKanban,
			color: "var(--module-feeds)",
		},
		{
			value: "99.9%",
			label: "Uptime",
			icon: ShieldCheck,
			color: "var(--module-notes)",
		},
	];

	return (
		<section className="py-12">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
				{stats.map((stat, idx) => {
					const Icon = stat.icon;
					return (
						<Card
							key={idx}
							padding="md"
							className="backdrop-blur-sm bg-card/80 text-center"
						>
							<CardContent className="p-0">
								<div
									className="inline-flex items-center justify-center w-12 h-12 rounded-none retro-border mb-4"
									style={{ backgroundColor: stat.color }}
								>
									<Icon className="h-6 w-6 text-foreground" />
								</div>
								<div className="text-4xl font-bold font-mono mb-2 text-foreground">
									{stat.value}
								</div>
								<CardDescription className="text-sm font-mono uppercase tracking-wider">
									{stat.label}
								</CardDescription>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</section>
	);
}

function Testimonials() {
	const testimonials = [
		{
			name: "Sarah Chen",
			role: "CEO, TechFlow",
			quote:
				"Wingmnn transformed how our team works. Everything we need is in one place, and the interface is so intuitive that our onboarding time dropped by 60%.",
			avatar: "SC",
		},
		{
			name: "Marcus Rodriguez",
			role: "Product Lead, DesignCo",
			quote:
				"The unified inbox alone saved me 2 hours every day. Plus, the wellness check-ins actually helped us catch burnout early. Game changer.",
			avatar: "MR",
		},
		{
			name: "Alex Kim",
			role: "Founder, StartupHub",
			quote:
				"We tried every tool under the sun. Wingmnn is the first one that actually reduced our tool sprawl instead of adding to it. Finally, clarity.",
			avatar: "AK",
		},
		{
			name: "Jordan Taylor",
			role: "Operations Manager, ScaleUp",
			quote:
				"The retro aesthetic is refreshing, but what really sold us was how seamlessly everything connects. Our team velocity increased by 40%.",
			avatar: "JT",
		},
		{
			name: "Riley Patel",
			role: "CTO, InnovateLab",
			quote:
				"Best decision we made this year. The async communication features and project tracking in one place? That's the future of work.",
			avatar: "RP",
		},
		{
			name: "Casey Morgan",
			role: "Head of People, GrowthCo",
			quote:
				"Wingmnn's wellness module caught issues we didn't even know we had. The team loves it, and our retention improved significantly.",
			avatar: "CM",
		},
	];

	return (
		<section className="space-y-12">
			<div className="text-center mb-12">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					What teams are saying
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Join thousands of teams who've streamlined their workflow with Wingmnn
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{testimonials.map((testimonial, idx) => (
					<Card
						key={idx}
						padding="md"
						variant="interactive"
						className="backdrop-blur-sm bg-card/80 flex flex-col gap-4 hover:shadow-lg"
					>
						<CardContent className="p-0 flex flex-col gap-4">
							<div className="flex items-start gap-4">
								<div
									className="w-12 h-12 rounded-none retro-border flex items-center justify-center shrink-0 font-bold text-foreground"
									style={{
										backgroundColor: `var(--module-${
											[
												"mail",
												"notes",
												"finance",
												"feeds",
												"messages",
												"calendar",
											][idx % 6]
										})`,
									}}
								>
									{testimonial.avatar}
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-foreground mb-1">
										{testimonial.name}
									</h4>
									<p className="text-sm text-muted-foreground font-mono">
										{testimonial.role}
									</p>
								</div>
							</div>
							<p className="text-foreground leading-relaxed flex-1">
								"{testimonial.quote}"
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
}

function FAQ() {
	const [openIndex, setOpenIndex] = React.useState<number | null>(0);

	const faqs = [
		{
			question: "How does Wingmnn differ from other productivity tools?",
			answer:
				"Wingmnn is a unified platform that brings all your team's essential tools together in one place. Instead of juggling multiple apps and tabs, everything—from email to projects, finance to wellness—is beautifully integrated. We focus on reducing tool sprawl, not adding to it.",
		},
		{
			question: "Can I integrate Wingmnn with my existing tools?",
			answer:
				"Yes! Wingmnn integrates with popular tools like Google Calendar, Slack, GitHub, and more. Our goal is to be the central hub that connects all your workflows, so you can keep using the tools you love while gaining the clarity of a unified platform.",
		},
		{
			question: "Is my data secure?",
			answer:
				"Absolutely. We use enterprise-grade security with end-to-end encryption. Your data is protected at every layer, and we're compliant with industry standards including SOC 2, GDPR, and more. Security isn't a feature—it's our foundation.",
		},
		{
			question: "What's included in the free trial?",
			answer:
				"Our 14-day free trial includes full access to all modules and features. No credit card required. You can invite your entire team and explore everything Wingmnn has to offer. If you love it, choose a plan that fits your team size.",
		},
		{
			question: "How quickly can my team get started?",
			answer:
				"Most teams are up and running in under 10 minutes. Our onboarding is designed to be intuitive, and we provide templates and guides to help you get started quickly. Plus, our support team is always available to help.",
		},
		{
			question: "Can I customize Wingmnn for my team's needs?",
			answer:
				"Yes! Wingmnn is highly customizable. You can configure workflows, set up custom integrations, create team rituals, and tailor the experience to match how your team works. Enterprise plans include even more customization options.",
		},
	];

	return (
		<section className="space-y-12">
			<div className="text-center mb-12">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					Frequently asked questions
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Everything you need to know about Wingmnn
				</p>
			</div>

			<div className="max-w-3xl mx-auto space-y-4">
				{faqs.map((faq, idx) => (
					<div
						key={idx}
						className="retro-border bg-card/80 backdrop-blur-sm rounded-none overflow-hidden"
					>
						<button
							type="button"
							onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
							className="w-full flex items-center justify-between p-6 text-left hover:bg-card/50 transition-colors"
						>
							<span className="text-lg font-semibold font-mono text-foreground pr-8">
								{faq.question}
							</span>
							<ChevronDown
								className={cn(
									"h-5 w-5 shrink-0 text-muted-foreground transition-transform",
									openIndex === idx && "rotate-180",
								)}
							/>
						</button>
						{openIndex === idx && (
							<div className="px-6 pb-6">
								<p className="text-muted-foreground leading-relaxed">
									{faq.answer}
								</p>
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	);
}

function VideoDemo() {
	const moduleColors = [
		"var(--module-mail)",
		"var(--module-notes)",
		"var(--module-finance)",
		"var(--module-feeds)",
		"var(--module-messages)",
		"var(--module-calendar)",
		"var(--module-wellness)",
		"var(--module-projects)",
		"var(--module-files)",
		"var(--module-fun)",
	];

	const shuffle = <T,>(array: T[]): T[] => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	const topColors = shuffle(moduleColors);
	const bottomColors = shuffle(moduleColors);
	const sideColors = shuffle(moduleColors).slice(0, 2);
	const leftColors = shuffle(sideColors);
	const rightColors = shuffle(sideColors);

	return (
		<section className="space-y-12">
			<div className="text-center mb-12">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					See Wingmnn in action
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Watch how teams use Wingmnn to streamline their workflow
				</p>
			</div>
			<div className="relative retro-border bg-card/80 backdrop-blur-sm rounded-none overflow-hidden">
				<div className="absolute top-0 left-0 right-0 flex h-1">
					{topColors.map((color, idx) => (
						<div
							key={`video-top-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>
				<div className="absolute bottom-0 left-0 right-0 flex h-1">
					{bottomColors.map((color, idx) => (
						<div
							key={`video-bottom-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>
				<div className="absolute top-0 left-0 bottom-0 flex flex-col w-1">
					{leftColors.map((color, idx) => (
						<div
							key={`video-left-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>
				<div className="absolute top-0 right-0 bottom-0 flex flex-col w-1">
					{rightColors.map((color, idx) => (
						<div
							key={`video-right-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>
				<div className="aspect-video bg-card/60 flex items-center justify-center">
					<div className="text-center space-y-4">
						<div className="inline-flex items-center justify-center w-20 h-20 rounded-full retro-border bg-primary/20">
							<Play className="h-10 w-10 text-primary ml-1" />
						</div>
						<p className="text-muted-foreground font-mono">
							Video demo coming soon
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

function UseCases() {
	const useCases = [
		{
			title: "For Remote Teams",
			description:
				"Keep distributed teams aligned with async communication, shared calendars, and unified project tracking.",
			icon: Users,
			color: "var(--module-messages)",
		},
		{
			title: "For Agencies",
			description:
				"Manage multiple clients, track billable hours, send invoices, and keep all client communication in one place.",
			icon: FolderKanban,
			color: "var(--module-finance)",
		},
		{
			title: "For Startups",
			description:
				"Scale from 2 to 200 without tool sprawl. One platform that grows with you from day one to IPO.",
			icon: TrendingUp,
			color: "var(--module-projects)",
		},
		{
			title: "For Enterprises",
			description:
				"Enterprise-grade security, compliance, and customization. Deploy on-premise or in the cloud.",
			icon: ShieldCheck,
			color: "var(--module-notes)",
		},
	];

	return (
		<section className="space-y-12">
			<div className="text-center mb-12">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					Built for every team
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Whether you're a startup or enterprise, Wingmnn adapts to your needs
				</p>
			</div>
			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				{useCases.map((useCase, idx) => {
					const Icon = useCase.icon;
					return (
						<Card
							key={idx}
							padding="md"
							variant="interactive"
							className="backdrop-blur-sm bg-card/80 hover:shadow-lg"
						>
							<CardContent className="p-0">
								<div
									className="inline-flex items-center justify-center w-12 h-12 rounded-none retro-border mb-4"
									style={{ backgroundColor: useCase.color }}
								>
									<Icon className="h-6 w-6 text-foreground" />
								</div>
								<CardHeader className="p-0 mb-2">
									<CardTitle className="text-xl font-bold font-mono uppercase">
										{useCase.title}
									</CardTitle>
								</CardHeader>
								<CardDescription>{useCase.description}</CardDescription>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</section>
	);
}

function IntegrationShowcase() {
	return (
		<section className="space-y-12">
			<div className="text-center mb-12">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					Integrates with your favorite tools
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Connect Wingmnn with the tools you already use and love
				</p>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
				{spotlightIntegrations.map((integration, idx) => {
					const Icon = integration.icon;
					return (
						<Card
							key={idx}
							padding="md"
							variant="interactive"
							className="backdrop-blur-sm bg-card/80 flex flex-col items-center justify-center gap-3 hover:shadow-lg"
						>
							<CardContent className="p-0 flex flex-col items-center justify-center gap-3">
								<div
									className="w-12 h-12 rounded-none retro-border flex items-center justify-center"
									style={{ backgroundColor: integration.color }}
								>
									<Icon className="h-6 w-6 text-foreground" />
								</div>
								<span className="text-xs font-mono text-center text-foreground">
									{integration.name}
								</span>
							</CardContent>
						</Card>
					);
				})}
			</div>
			<div className="text-center">
				<Button
					variant="outline"
					type="button"
					asChild
				>
					<Link
						to="/integrations"
						className="inline-flex items-center gap-2"
					>
						View All Integrations
						<LinkIcon className="h-4 w-4 ml-2" />
					</Link>
				</Button>
			</div>
		</section>
	);
}

function CaseStudies() {
	const caseStudies = [
		{
			company: "TechFlow",
			industry: "SaaS",
			teamSize: "50 employees",
			results: [
				"60% reduction in onboarding time",
				"2 hours saved per day per employee",
				"40% increase in team velocity",
			],
			color: "var(--module-mail)",
		},
		{
			company: "DesignCo",
			industry: "Design Agency",
			teamSize: "25 employees",
			results: [
				"Unified client communication",
				"50% faster project delivery",
				"100% client satisfaction",
			],
			color: "var(--module-projects)",
		},
		{
			company: "StartupHub",
			industry: "Startup",
			teamSize: "10 employees",
			results: [
				"Reduced tool costs by 70%",
				"Zero context switching",
				"3x faster decision making",
			],
			color: "var(--module-feeds)",
		},
	];

	return (
		<section className="space-y-12">
			<div className="text-center mb-12">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					Real results from real teams
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					See how teams like yours transformed their workflow with Wingmnn
				</p>
			</div>
			<div className="grid md:grid-cols-3 gap-6">
				{caseStudies.map((study, idx) => (
					<Card
						key={idx}
						padding="lg"
						className="backdrop-blur-sm bg-card/80"
					>
						<CardHeader>
							<div className="mb-2">
								<div
									className="w-3 h-3 shrink-0 mb-2"
									style={{ backgroundColor: study.color }}
								/>
								<CardTitle className="text-2xl font-bold font-mono uppercase mb-2">
									{study.company}
								</CardTitle>
								<CardDescription className="text-sm font-mono">
									{study.industry} • {study.teamSize}
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{study.results.map((result, i) => (
									<li
										key={i}
										className="flex items-start gap-3 text-sm text-foreground"
									>
										<Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
										<span>{result}</span>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
}

function PricingPreview() {
	return (
		<section className="space-y-12">
			<div className="text-center mb-12">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					Simple, transparent pricing
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Choose the plan that fits your team. All plans include a 14-day free
					trial.
				</p>
			</div>
			<div className="grid md:grid-cols-4 gap-6">
				{pricingPlans.map((plan, idx) => (
					<div
						key={idx}
						className="relative"
					>
						{plan.highlight && (
							<span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-mono uppercase">
								Popular
							</span>
						)}
						<Card
							padding="lg"
							className={cn(
								"backdrop-blur-sm bg-card/80",
								plan.highlight && "ring-2 ring-primary",
							)}
						>
							<CardContent className="p-0">
								<div className="text-center mb-6">
									<CardTitle className="text-xl font-bold font-mono uppercase mb-2">
										{plan.name}
									</CardTitle>
									<div className="flex items-baseline justify-center gap-2">
										<span className="text-4xl font-bold">{plan.price}</span>
										{plan.price !== "Custom" && (
											<span className="text-sm text-muted-foreground">
												{plan.period}
											</span>
										)}
									</div>
								</div>
								<Button
									className="w-full"
									variant={plan.highlight ? "default" : "outline"}
									type="button"
								>
									{plan.price === "Custom"
										? "Contact Sales"
										: "Start Free Trial"}
								</Button>
							</CardContent>
						</Card>
					</div>
				))}
			</div>
			<div className="text-center">
				<Button
					variant="outline"
					type="button"
					asChild
				>
					<Link
						to="/pricing"
						className="inline-flex items-center gap-2"
					>
						View Full Pricing
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>
		</section>
	);
}

function ComparisonTable() {
	const features = [
		{
			feature: "Unified Platform",
			wingmnn: true,
			competitor1: false,
			competitor2: false,
		},
		{
			feature: "Email Management",
			wingmnn: true,
			competitor1: true,
			competitor2: false,
		},
		{
			feature: "Project Tracking",
			wingmnn: true,
			competitor1: false,
			competitor2: true,
		},
		{
			feature: "Team Wellness",
			wingmnn: true,
			competitor1: false,
			competitor2: false,
		},
		{
			feature: "Finance Module",
			wingmnn: true,
			competitor1: false,
			competitor2: false,
		},
		{
			feature: "End-to-End Encryption",
			wingmnn: true,
			competitor1: true,
			competitor2: true,
		},
		{
			feature: "Custom Integrations",
			wingmnn: true,
			competitor1: true,
			competitor2: true,
		},
		{
			feature: "On-Premise Option",
			wingmnn: true,
			competitor1: false,
			competitor2: false,
		},
	];

	return (
		<section className="space-y-12">
			<div className="text-center mb-12">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					Wingmnn vs. the competition
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					See how Wingmnn compares to other productivity platforms
				</p>
			</div>
			<div className="retro-border bg-card/80 backdrop-blur-sm rounded-none overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-border">
								<th className="text-left p-4 font-mono uppercase text-foreground">
									Feature
								</th>
								<th className="text-center p-4 font-mono uppercase text-foreground">
									Wingmnn
								</th>
								<th className="text-center p-4 font-mono uppercase text-muted-foreground">
									Competitor A
								</th>
								<th className="text-center p-4 font-mono uppercase text-muted-foreground">
									Competitor B
								</th>
							</tr>
						</thead>
						<tbody>
							{features.map((row, idx) => (
								<tr
									key={idx}
									className="border-b border-border/50 hover:bg-card/50"
								>
									<td className="p-4 text-foreground">{row.feature}</td>
									<td className="p-4 text-center">
										{row.wingmnn ? (
											<Check className="h-5 w-5 text-primary mx-auto" />
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</td>
									<td className="p-4 text-center">
										{row.competitor1 ? (
											<Check className="h-5 w-5 text-muted-foreground mx-auto" />
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</td>
									<td className="p-4 text-center">
										{row.competitor2 ? (
											<Check className="h-5 w-5 text-muted-foreground mx-auto" />
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}

function SocialProofBadges() {
	const badges = [
		{
			name: "SOC 2 Certified",
			icon: ShieldCheck,
			color: "var(--module-notes)",
		},
		{ name: "GDPR Compliant", icon: ShieldCheck, color: "var(--module-feeds)" },
		{ name: "ISO 27001", icon: ShieldCheck, color: "var(--module-finance)" },
		{ name: "99.9% Uptime SLA", icon: Zap, color: "var(--module-mail)" },
	];

	return (
		<section className="py-12">
			<div className="text-center mb-8">
				<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
					Trusted & Certified
				</p>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
				{badges.map((badge, idx) => {
					const Icon = badge.icon;
					return (
						<Card
							key={idx}
							padding="md"
							className="backdrop-blur-sm bg-card/80 text-center"
						>
							<CardContent className="p-0">
								<div
									className="inline-flex items-center justify-center w-12 h-12 rounded-none retro-border mb-4"
									style={{ backgroundColor: badge.color }}
								>
									<Icon className="h-6 w-6 text-foreground" />
								</div>
								<p className="text-sm font-mono text-foreground">
									{badge.name}
								</p>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</section>
	);
}

function NewsletterSignup() {
	const [email, setEmail] = React.useState("");

	return (
		<section className="py-16">
			<Card
				padding="lg"
				className="backdrop-blur-sm bg-card/80 p-12 md:p-16"
			>
				<CardContent className="max-w-2xl mx-auto text-center space-y-6 p-0">
					<Mail className="h-12 w-12 text-primary mx-auto" />
					<h2 className="text-3xl md:text-4xl font-bold text-foreground">
						Stay in the loop
					</h2>
					<p className="text-lg text-muted-foreground">
						Get product updates, tips, and insights delivered to your inbox
					</p>
					<form
						className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-md mx-auto"
						onSubmit={(e) => {
							e.preventDefault();
							// Handle newsletter signup
							console.log("Newsletter signup:", email);
						}}
					>
						<Input
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="flex-1"
							required
						/>
						<Button
							type="submit"
							size="lg"
						>
							Subscribe
						</Button>
					</form>
					<p className="text-xs text-muted-foreground font-mono">
						No spam. Unsubscribe anytime.
					</p>
				</CardContent>
			</Card>
		</section>
	);
}

function ResourceLinks() {
	const resources = [
		{
			name: "Documentation",
			icon: Book,
			href: "/help",
			color: "var(--module-notes)",
		},
		{
			name: "Blog",
			icon: FileText,
			href: "/blog",
			color: "var(--module-feeds)",
		},
		{
			name: "API Docs",
			icon: Code,
			href: "/api-docs",
			color: "var(--module-files)",
		},
		{
			name: "Status",
			icon: ShieldCheck,
			href: "/status",
			color: "var(--module-mail)",
		},
	];

	return (
		<section className="py-12">
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold mb-4 text-foreground">
					Resources & Support
				</h2>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
				{resources.map((resource, idx) => {
					const Icon = resource.icon;
					return (
						<a
							key={idx}
							href={resource.href}
							className="block"
						>
							<Card
								padding="md"
								variant="interactive"
								className="backdrop-blur-sm bg-card/80 hover:shadow-lg text-center group"
							>
								<CardContent className="p-0">
									<div
										className="inline-flex items-center justify-center w-12 h-12 rounded-none retro-border mb-4 group-hover:scale-110 transition-transform"
										style={{ backgroundColor: resource.color }}
									>
										<Icon className="h-6 w-6 text-foreground" />
									</div>
									<p className="font-mono text-foreground font-semibold">
										{resource.name}
									</p>
								</CardContent>
							</Card>
						</a>
					);
				})}
			</div>
		</section>
	);
}

function FinalCTA() {
	return (
		<section className="py-16">
			<Card
				padding="lg"
				className="backdrop-blur-sm bg-card/80 p-12 md:p-16 text-center"
			>
				<CardContent className="p-0">
					<CardTitle className="text-4xl md:text-5xl font-bold mb-4">
						Ready to streamline your team?
					</CardTitle>
					<CardDescription className="text-xl mb-8 max-w-2xl mx-auto">
						Join thousands of teams who've transformed their workflow with
						Wingmnn. Start your free 14-day trial today.
					</CardDescription>
					<div className="flex flex-wrap items-center justify-center gap-4">
						<Button
							className="flex items-center gap-2"
							type="button"
							size="lg"
						>
							Start Free Trial
							<ArrowRight className="h-4 w-4" />
						</Button>
						<Button
							className=""
							type="button"
							variant="outline"
							size="lg"
						>
							Schedule a Demo
						</Button>
					</div>
					<p className="text-sm text-muted-foreground mt-6 font-mono">
						No credit card required • Cancel anytime
					</p>
				</CardContent>
			</Card>
		</section>
	);
}
