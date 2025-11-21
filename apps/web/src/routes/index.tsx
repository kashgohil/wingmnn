import { generateMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	Calendar,
	ChevronDown,
	DollarSign,
	FileText,
	Folder,
	FolderKanban,
	Heart,
	Inbox,
	MessageSquare,
	PartyPopper,
	Rss,
	ShieldCheck,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import * as React from "react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/")({
	component: App,
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

			{/* Soft pastel glow effects */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[120px] opacity-10 animate-pulse" />
				<div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent rounded-full blur-[120px] opacity-10 animate-pulse delay-1000" />
			</div>

			<div className="relative mx-auto flex max-w-7xl flex-col gap-24 px-6 pt-6 pb-24">
				<FloatingHeader />
				<Hero />
				<Features />
				<ClientLogos />
				<Stats />
				<Modules />
				<Testimonials />
				<FAQ />
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
			<div className="inline-flex items-center gap-3 mx-auto px-4 py-2 retro-border bg-card/80 backdrop-blur-sm rounded-none">
				<ShieldCheck className="h-4 w-4 text-primary" />
				<span className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
					Human-centered ops stack
				</span>
			</div>

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

			{/* Hero visual */}
			<div className="relative mt-8 mx-auto w-full max-w-4xl">
				<div className="relative retro-border bg-card/80 p-8 backdrop-blur-sm overflow-hidden rounded-none">
					<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
					<div className="relative grid grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-48 retro-border bg-card/60 backdrop-blur-sm rounded-none animate-pulse"
								style={{
									animationDelay: `${i * 200}ms`,
								}}
							/>
						))}
					</div>
				</div>
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
						<div
							key={feature.title}
							className="group relative retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none hover:shadow-lg transition-all duration-300"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative">
								<div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-none retro-border bg-primary/10 text-primary">
									<Icon className="h-6 w-6" />
								</div>
								<h3 className="text-xl font-semibold mb-2 font-mono uppercase tracking-wider">
									{feature.title}
								</h3>
								<p className="text-muted-foreground">{feature.description}</p>
							</div>
						</div>
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
				<div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
				<div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

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
		<div className="relative group">
			<div
				className={cn(
					"absolute top-0 bottom-0 w-2 opacity-0 group-hover:opacity-100 transition-opacity",
					isEven ? "-left-4" : "-right-4",
				)}
				style={{ backgroundColor: moduleColor }}
			/>
			<div className="relative retro-border group">
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
						</div>
					</div>
				</div>
			</div>
		</div>
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
						<div
							key={idx}
							className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none text-center"
						>
							<div
								className="inline-flex items-center justify-center w-12 h-12 rounded-none retro-border mb-4"
								style={{ backgroundColor: stat.color }}
							>
								<Icon className="h-6 w-6 text-foreground" />
							</div>
							<div className="text-4xl font-bold font-mono mb-2 text-foreground">
								{stat.value}
							</div>
							<div className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
								{stat.label}
							</div>
						</div>
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
					<div
						key={idx}
						className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none flex flex-col gap-4 hover:shadow-lg transition-all duration-300"
					>
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
					</div>
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

function FinalCTA() {
	return (
		<section className="py-16">
			<div className="retro-border bg-card/80 backdrop-blur-sm p-12 md:p-16 rounded-none text-center">
				<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
					Ready to streamline your team?
				</h2>
				<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
					Join thousands of teams who've transformed their workflow with
					Wingmnn. Start your free 14-day trial today.
				</p>
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
			</div>
		</section>
	);
}
