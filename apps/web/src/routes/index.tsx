import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	Calendar,
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
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/")({ component: App });

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
				<Modules />
				<Stats />
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
					<span className="text-primary">Wingmnn</span>{" "}
					<span className="text-foreground">
						keeps every part of your team rhythm tidy, from mails to fun.
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

function Modules() {
	return (
		<section className="space-y-16">
			<div className="text-center mb-12">
				<div className="inline-flex items-center gap-2 mb-4">
					<Sparkles className="h-6 w-6 text-primary" />
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
		<div className="relative overflow-hidden retro-border">
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
	);
}

function Stats() {
	const stats = [
		{ value: "10K+", label: "Active Teams", color: "var(--primary)" },
		{ value: "99.9%", label: "Uptime", color: "var(--accent)" },
		{ value: "50M+", label: "Messages Sent", color: "var(--chart-3)" },
		{ value: "24/7", label: "Support", color: "var(--chart-4)" },
	];

	return (
		<section className="grid grid-cols-2 md:grid-cols-4 gap-6">
			{stats.map((stat) => (
				<div
					key={stat.label}
					className="text-center p-6 retro-border bg-card/80 backdrop-blur-sm rounded-none hover:shadow-lg transition-all duration-300"
				>
					<div
						className="text-3xl md:text-4xl font-bold mb-2 font-mono"
						style={{ color: stat.color }}
					>
						{stat.value}
					</div>
					<div className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
						{stat.label}
					</div>
				</div>
			))}
		</section>
	);
}
