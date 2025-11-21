import {
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
	type LucideIcon,
} from "lucide-react";

export interface Module {
	name: string;
	slug: string;
	description: string;
	detailedDescription: string;
	features: string[];
	colorVar: string;
	icon: LucideIcon;
	useCases?: string[];
	benefits?: string[];
	integrations?: string[];
	stats?: {
		label: string;
		value: string;
	}[];
}

export const modules: Module[] = [
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
		useCases: [
			"Manage multiple email accounts from one interface",
			"Never miss important emails with AI prioritization",
			"Automatically track and remind about follow-ups",
			"Quick reply with pre-built templates",
			"Get insights into email response times and patterns",
		],
		benefits: [
			"Save 2+ hours daily on email management",
			"Reduce missed follow-ups by 90%",
			"Improve response times with smart prioritization",
			"Unified view of all communications",
		],
		integrations: ["Gmail", "Outlook", "Apple Mail", "IMAP", "Exchange"],
		stats: [
			{ label: "Time Saved", value: "2+ hrs/day" },
			{ label: "Accounts Supported", value: "Unlimited" },
			{ label: "Response Time", value: "50% faster" },
		],
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
		useCases: [
			"Document meeting notes with automatic summaries",
			"Build a knowledge base with interconnected notes",
			"Collaborate in real-time on documentation",
			"Track changes with full version history",
			"Organize with tags and smart folders",
		],
		benefits: [
			"Discover hidden connections between ideas",
			"Save time with AI-generated summaries",
			"Never lose context with full history",
			"Build a living knowledge base",
		],
		integrations: ["Markdown", "Export to PDF", "Sync with Files module"],
		stats: [
			{ label: "AI Summaries", value: "Instant" },
			{ label: "Backlinks Found", value: "Auto" },
			{ label: "Version History", value: "Unlimited" },
		],
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
		useCases: [
			"Track all financial transactions in one place",
			"Create and send professional invoices",
			"Streamline approval processes",
			"Forecast cashflow with AI insights",
			"Manage multi-currency operations",
		],
		benefits: [
			"Real-time financial visibility",
			"Faster invoice processing",
			"Better cashflow management",
			"Automated expense categorization",
		],
		integrations: ["Banking APIs", "Stripe", "PayPal", "QuickBooks", "Xero"],
		stats: [
			{ label: "Invoice Processing", value: "3x faster" },
			{ label: "Forecast Accuracy", value: "95%+" },
			{ label: "Currencies", value: "150+" },
		],
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
		useCases: [
			"Stay updated on team activities",
			"Follow industry news and trends",
			"Curate personalized information streams",
			"Save articles for later reading",
			"Share insights with your team",
		],
		benefits: [
			"Stay informed without information overload",
			"Customize your information diet",
			"Never miss important updates",
			"Build a knowledge repository",
		],
		integrations: ["RSS Feeds", "News APIs", "Social Media", "Custom Sources"],
		stats: [
			{ label: "Sources", value: "Unlimited" },
			{ label: "Filter Options", value: "50+" },
			{ label: "Time Saved", value: "1 hr/day" },
		],
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
		useCases: [
			"Secure team communication",
			"Send voice notes when typing isn't enough",
			"Record video updates asynchronously",
			"Search through message history",
			"Share files and media securely",
		],
		benefits: [
			"End-to-end encryption for security",
			"Flexible communication options",
			"Never lose important messages",
			"Work across time zones easily",
		],
		integrations: ["Slack", "Teams", "Discord", "WhatsApp Business"],
		stats: [
			{ label: "Encryption", value: "E2E" },
			{ label: "Message History", value: "Unlimited" },
			{ label: "File Size", value: "10GB max" },
		],
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
		useCases: [
			"Schedule meetings with smart time suggestions",
			"Track project deadlines and milestones",
			"Sync with Google Calendar, Outlook, and more",
			"Never double-book with availability sync",
			"Set up recurring team rituals",
		],
		benefits: [
			"Save time with smart scheduling",
			"Never miss important deadlines",
			"Seamless calendar synchronization",
			"Better time management",
		],
		integrations: [
			"Google Calendar",
			"Outlook",
			"Apple Calendar",
			"CalDAV",
			"iCal",
		],
		stats: [
			{ label: "Calendar Sync", value: "Real-time" },
			{ label: "Scheduling Time", value: "80% faster" },
			{ label: "Integrations", value: "10+" },
		],
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
		useCases: [
			"Monitor team wellbeing with daily check-ins",
			"Detect burnout early with AI analysis",
			"Boost focus with curated music playlists",
			"Track wellness trends over time",
			"Set and achieve personal wellness goals",
		],
		benefits: [
			"Early burnout detection",
			"Improved team morale",
			"Better work-life balance",
			"Data-driven wellness insights",
		],
		integrations: ["Spotify", "Apple Music", "Health Apps", "Fitness Trackers"],
		stats: [
			{ label: "Burnout Detection", value: "Early" },
			{ label: "Check-in Response", value: "90%+" },
			{ label: "Playlists", value: "100+" },
		],
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
		useCases: [
			"Create visual roadmaps tied to outcomes",
			"Break down projects into actionable tasks",
			"Track progress with real-time analytics",
			"Plan resources and capacity",
			"Establish team rituals and standups",
		],
		benefits: [
			"Ship 30% faster with clear roadmaps",
			"Better resource planning",
			"Outcome-focused execution",
			"Improved team alignment",
		],
		integrations: ["Jira", "Asana", "Linear", "GitHub", "GitLab", "Trello"],
		stats: [
			{ label: "Ship Speed", value: "30% faster" },
			{ label: "Task Completion", value: "95%+" },
			{ label: "Team Alignment", value: "100%" },
		],
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
		useCases: [
			"Never lose files with automatic versioning",
			"Find files instantly with smart search",
			"Hand off work seamlessly between team members",
			"Control access with granular permissions",
			"Sync with cloud storage providers",
		],
		benefits: [
			"Zero file loss with versioning",
			"Instant file discovery",
			"Smooth collaboration",
			"Secure file sharing",
		],
		integrations: ["Google Drive", "Dropbox", "OneDrive", "Box", "Amazon S3"],
		stats: [
			{ label: "Version History", value: "Unlimited" },
			{ label: "Search Speed", value: "<1s" },
			{ label: "Storage", value: "Unlimited" },
		],
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
		useCases: [
			"Build team culture with async games",
			"Automatically celebrate team wins",
			"Create team rituals and traditions",
			"Foster connections in virtual teams",
			"Gamify team achievements",
		],
		benefits: [
			"Stronger team bonds",
			"Improved morale",
			"Better remote team culture",
			"Increased engagement",
		],
		integrations: ["Slack", "Discord", "Teams", "Custom Games"],
		stats: [
			{ label: "Team Engagement", value: "85%+" },
			{ label: "Games Available", value: "20+" },
			{ label: "Celebrations", value: "Auto" },
		],
	},
];

export function getModuleBySlug(slug: string): Module | undefined {
	return modules.find(
		(module) => module.slug.toLowerCase() === slug.toLowerCase(),
	);
}

export function getAllModuleSlugs(): string[] {
	return modules.map((module) => module.slug);
}
