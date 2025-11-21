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
	features: Array<
		| string
		| {
				title: string;
				description: string;
		  }
	>;
	colorVar: string;
	icon: LucideIcon;
	useCases?: Array<
		| string
		| {
				title: string;
				description: string;
		  }
	>;
	benefits?: Array<
		| string
		| {
				title: string;
				description: string;
		  }
	>;
	integrations?: string[];
	stats?: {
		label: string;
		value: string;
	}[];
	workflowSteps?: Array<{
		title: string;
		description: string;
		icon: string;
	}>;
}

export const modules: Module[] = [
	{
		name: "Mails",
		slug: "mails",
		description: "Unified inbox, priority sorting, follow-up nudges.",
		detailedDescription:
			"Transform your email chaos into organized clarity. Wingmnn's unified inbox brings all your accounts together in one place, with intelligent priority sorting that surfaces what matters most. Never miss a follow-up with smart nudges that remind you when conversations need attention.",
		features: [
			{
				title: "Unified inbox for all email accounts",
				description:
					"Connect Gmail, Outlook, Apple Mail, and any IMAP or Exchange account into a single, unified inbox. No more switching between multiple tabs or apps. All your emails appear in one organized stream, making it easy to stay on top of everything without the mental overhead of context switching.",
			},
			{
				title: "AI-powered priority sorting",
				description:
					"Our intelligent algorithm learns from your behavior to automatically surface the most important emails first. It analyzes sender relationships, email content, response patterns, and urgency signals to ensure critical messages never get buried. The more you use it, the smarter it gets at understanding what matters to you.",
			},
			{
				title: "Smart follow-up reminders",
				description:
					"Never let an important conversation slip through the cracks. Wingmnn automatically tracks emails that need responses and intelligently reminds you at the optimal time. It considers factors like sender importance, conversation history, and your typical response patterns to nudge you when follow-ups are truly needed.",
			},
			{
				title: "Quick actions and templates",
				description:
					"Respond faster with pre-built email templates and quick action buttons. Create templates for common responses, and use one-click actions for scheduling, forwarding, or archiving. Save hours every week by eliminating repetitive typing and decision-making.",
			},
			{
				title: "Seamless integration with calendar",
				description:
					"Email and calendar work together seamlessly. When someone suggests a meeting time in an email, Wingmnn automatically detects it and offers to add it to your calendar. Meeting invitations are intelligently parsed, and conflicts are flagged before you commit.",
			},
			{
				title: "Email analytics and insights",
				description:
					"Understand your email habits with detailed analytics. Track response times, identify your busiest communication periods, see which senders you interact with most, and discover patterns that help you optimize your workflow. Data-driven insights help you become more efficient over time.",
			},
		],
		colorVar: "--module-mail",
		icon: Inbox,
		useCases: [
			{
				title: "Manage multiple email accounts from one interface",
				description:
					"Whether you're juggling a work email, personal Gmail, and a client-specific Outlook account, Wingmnn brings them all together. Switch between accounts instantly, or view them all in a unified stream. Perfect for consultants, freelancers, or anyone managing multiple professional identities.",
			},
			{
				title: "Never miss important emails with AI prioritization",
				description:
					"The AI learns which emails are critical to you—whether from your CEO, key clients, or time-sensitive notifications. Important messages automatically rise to the top, while newsletters and low-priority items are organized below. You'll never miss a crucial email again, even when your inbox is overflowing.",
			},
			{
				title: "Automatically track and remind about follow-ups",
				description:
					"When you send an email that needs a response, Wingmnn tracks it automatically. If you don't hear back within a reasonable timeframe, you'll get a gentle reminder. The system learns your follow-up preferences—some conversations need immediate attention, while others can wait. Never let an important thread die.",
			},
			{
				title: "Quick reply with pre-built templates",
				description:
					"Create templates for your most common email responses—meeting confirmations, status updates, thank you notes, and more. With one click, insert a template and customize it. Save hours every week by eliminating repetitive typing, especially useful for customer support, sales, or administrative roles.",
			},
			{
				title: "Get insights into email response times and patterns",
				description:
					"Understand your email habits with comprehensive analytics. See your average response time, identify your most active communication hours, track which types of emails take longest to handle, and discover opportunities to improve. Use these insights to set better boundaries and optimize your communication workflow.",
			},
		],
		benefits: [
			{
				title: "Save 2+ hours daily on email management",
				description:
					"By consolidating multiple inboxes, automating prioritization, and providing quick actions, Wingmnn dramatically reduces the time spent on email management. Users report saving 2-3 hours per day that would otherwise be spent switching between accounts, manually sorting emails, and crafting repetitive responses. This time can be redirected to high-value work.",
			},
			{
				title: "Reduce missed follow-ups by 90%",
				description:
					"With intelligent tracking and automated reminders, important conversations never fall through the cracks. The system proactively surfaces emails that need attention, considering context and urgency. Teams using Wingmnn report a 90% reduction in missed follow-ups, leading to better client relationships and faster project completion.",
			},
			{
				title: "Improve response times with smart prioritization",
				description:
					"By automatically surfacing the most important emails first, you can respond to critical messages faster. The AI ensures urgent client requests, team communications, and time-sensitive items get immediate attention, while lower-priority emails are organized for later. This leads to 50% faster response times on average.",
			},
			{
				title: "Unified view of all communications",
				description:
					"Having all your emails in one place eliminates the cognitive load of managing multiple inboxes. You can see your entire communication landscape at a glance, understand priorities across all accounts, and maintain better context. This unified view reduces stress and improves decision-making about what to tackle next.",
			},
		],
		integrations: ["Gmail", "Outlook", "Apple Mail", "IMAP", "Exchange"],
		stats: [
			{ label: "Time Saved", value: "2+ hrs/day" },
			{ label: "Accounts Supported", value: "Unlimited" },
			{ label: "Response Time", value: "50% faster" },
		],
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Mails module in your workspace settings and connect your email accounts. Wingmnn supports Gmail, Outlook, Apple Mail, and any IMAP or Exchange server. The setup wizard guides you through authentication for each account. Once connected, all your emails will start flowing into the unified inbox. The AI begins learning your preferences immediately, analyzing your email patterns to understand what's important to you.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Customize your email experience by setting up filters, creating response templates, and configuring notification preferences. Set up rules for automatic categorization, define your follow-up reminder preferences, and connect your calendar for seamless meeting scheduling. The AI prioritization engine starts working right away, but you can fine-tune it by marking emails as important or low-priority to help it learn faster.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As you use Wingmnn, the system gets smarter about your preferences. Review analytics regularly to understand your email patterns and optimize your workflow. Add more accounts as needed, create additional templates for different scenarios, and leverage the insights to improve your communication efficiency. The more you use it, the more time you save.",
			},
		],
	},
	{
		name: "Notes",
		slug: "notes",
		description: "Lightweight docs with AI summaries and backlinks.",
		detailedDescription:
			"Capture ideas, document decisions, and build knowledge that connects. Our lightweight note-taking system uses AI to generate summaries and automatically creates backlinks between related notes, helping you discover connections you might have missed.",
		features: [
			{
				title: "Markdown support with rich formatting",
				description:
					"Write naturally using Markdown syntax for formatting, code blocks, tables, and more. Wingmnn renders your Markdown beautifully with syntax highlighting, making technical documentation, code snippets, and formatted text look professional. Support for LaTeX math equations, Mermaid diagrams, and embedded media makes it perfect for any type of documentation.",
			},
			{
				title: "AI-generated summaries",
				description:
					"Every note gets an instant AI-generated summary that captures the key points, decisions, and action items. These summaries appear in search results, note previews, and backlink suggestions, helping you quickly understand content without reading entire documents. Perfect for long meeting notes, research documents, or complex project documentation.",
			},
			{
				title: "Automatic backlink discovery",
				description:
					"The system automatically detects connections between notes by analyzing content, topics, people mentioned, and concepts discussed. When you view a note, you'll see all related notes linked automatically. This creates a web of knowledge that helps you discover relationships you might have missed, turning your notes into a true knowledge graph.",
			},
			{
				title: "Real-time collaboration",
				description:
					"Multiple team members can edit the same note simultaneously with live cursor positions and changes visible in real-time. Comments and suggestions make collaborative editing seamless. Perfect for team documentation, meeting notes, or shared knowledge bases where multiple people contribute.",
			},
			{
				title: "Version history and snapshots",
				description:
					"Every change is automatically saved with full version history. You can see who changed what and when, revert to any previous version, or create named snapshots for important milestones. Never lose work or context—the complete history of every note is preserved indefinitely, making it easy to track how ideas and decisions evolved.",
			},
			{
				title: "Tag and folder organization",
				description:
					"Organize notes with flexible tagging and folder structures. Tags can be hierarchical, and notes can belong to multiple folders. Smart folders automatically collect notes based on criteria like tags, dates, or content. This dual organization system—tags for topics and folders for projects—gives you maximum flexibility in how you structure your knowledge.",
			},
		],
		colorVar: "--module-notes",
		icon: FileText,
		useCases: [
			{
				title: "Document meeting notes with automatic summaries",
				description:
					"During or after meetings, capture detailed notes knowing that AI will automatically generate a concise summary. The summary highlights key decisions, action items, and important points, making it easy to share with stakeholders or reference later. Backlinks automatically connect related meeting notes, helping you see the full context of ongoing discussions.",
			},
			{
				title: "Build a knowledge base with interconnected notes",
				description:
					"Create a living knowledge base where notes automatically link to related content. As you add more notes, the system discovers connections between concepts, projects, and ideas. This creates a web of knowledge that grows more valuable over time, helping team members discover relevant information and understand how different pieces of knowledge relate to each other.",
			},
			{
				title: "Collaborate in real-time on documentation",
				description:
					"Multiple team members can work on the same document simultaneously, with changes visible in real-time. Use comments for discussions, suggestions for edits, and version history to track changes. Perfect for collaborative documentation, shared research, or team knowledge bases where multiple people need to contribute and stay in sync.",
			},
			{
				title: "Track changes with full version history",
				description:
					"Every edit is automatically saved with complete version history. See exactly what changed, who made the change, and when. Revert to any previous version if needed, or create named snapshots for important milestones. This gives you confidence to edit freely, knowing you can always go back, and provides an audit trail for important decisions.",
			},
			{
				title: "Organize with tags and smart folders",
				description:
					"Use tags to categorize notes by topic, project, or theme, and folders to organize by project or team. Smart folders automatically collect notes based on criteria you define. This flexible organization system adapts to how you work, whether you prefer hierarchical folders, flat tagging, or a hybrid approach. Find notes instantly with powerful search that understands content, not just keywords.",
			},
		],
		benefits: [
			{
				title: "Discover hidden connections between ideas",
				description:
					"Automatic backlink discovery reveals relationships between notes that you might not have noticed. When working on a project, you'll see related notes from past projects, similar concepts, or relevant research automatically linked. This helps you leverage existing knowledge, avoid reinventing solutions, and build on previous work more effectively.",
			},
			{
				title: "Save time with AI-generated summaries",
				description:
					"Instead of reading through long documents to find key information, AI summaries give you instant understanding. Search results show summaries, making it easy to find relevant notes quickly. When reviewing old notes, summaries help you quickly refresh your memory without reading entire documents. This saves hours every week, especially for teams with extensive documentation.",
			},
			{
				title: "Never lose context with full history",
				description:
					"Complete version history means you never lose important context. See how ideas evolved, what decisions were made and why, and who contributed what. This is invaluable for onboarding new team members, understanding project history, or revisiting past decisions. The full audit trail provides confidence and clarity.",
			},
			{
				title: "Build a living knowledge base",
				description:
					"Your notes become more valuable over time as connections are discovered and the knowledge graph grows. What starts as simple note-taking evolves into a comprehensive knowledge base that the entire team can leverage. New team members can quickly get up to speed, and everyone benefits from the collective knowledge captured in the system.",
			},
		],
		integrations: ["Markdown", "Export to PDF", "Sync with Files module"],
		stats: [
			{ label: "AI Summaries", value: "Instant" },
			{ label: "Backlinks Found", value: "Auto" },
			{ label: "Version History", value: "Unlimited" },
		],
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Notes module and start creating your first note. The interface is clean and distraction-free, perfect for focused writing. You can immediately start using Markdown for formatting, and the AI will begin generating summaries automatically. Set up your initial folder structure or start with tags—the system adapts to your organizational style.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Customize your note-taking experience by setting up templates for common note types (meeting notes, project docs, research), configuring AI summary preferences, and defining your tagging system. Set up smart folders that automatically organize notes based on criteria you define. Connect with the Files module to attach documents, or integrate with other modules for seamless workflows.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As your note collection grows, the backlink system becomes increasingly valuable, revealing connections you might have missed. Use analytics to understand your note-taking patterns, identify gaps in documentation, and see which notes are most referenced. The knowledge graph becomes a powerful tool for discovery and knowledge management as it grows.",
			},
		],
	},
	{
		name: "Finance",
		slug: "finance",
		description: "Cashflow, invoices, and approvals in one stream.",
		detailedDescription:
			"Keep your financial pulse in one unified view. Track cashflow, manage invoices, and handle approvals all in a single stream. Get real-time insights into your financial health with automated categorization and smart forecasting.",
		features: [
			{
				title: "Unified financial dashboard",
				description:
					"See all your financial data in one comprehensive dashboard. Track income, expenses, cashflow, invoices, and approvals in real-time. Customizable widgets let you focus on the metrics that matter most to your business. Get instant visibility into your financial health without switching between multiple tools or spreadsheets.",
			},
			{
				title: "Invoice creation and tracking",
				description:
					"Create professional invoices in seconds with customizable templates. Track invoice status from draft to paid, send automatic reminders, and get notified when clients view or pay invoices. Integration with payment processors means invoices can be paid directly, reducing days sales outstanding and improving cashflow.",
			},
			{
				title: "Approval workflows",
				description:
					"Set up custom approval workflows for expenses, invoices, and payments. Route approvals to the right people based on amount, category, or project. Get notifications when approvals are needed, and track approval history for audit purposes. Streamline financial decision-making while maintaining proper controls.",
			},
			{
				title: "Automated categorization",
				description:
					"AI-powered categorization automatically sorts transactions into the right categories based on merchant, description, and historical patterns. Learn from your corrections to get smarter over time. Reduce manual data entry by 80% while maintaining accuracy. Perfect for expense management and accounting reconciliation.",
			},
			{
				title: "Cashflow forecasting",
				description:
					"Predict future cashflow with AI-powered forecasting that analyzes historical patterns, recurring transactions, and seasonal trends. See projected cashflow weeks or months ahead, identify potential shortfalls early, and make informed decisions about spending, investments, or financing needs. Forecasts update automatically as new data comes in.",
			},
			{
				title: "Multi-currency support",
				description:
					"Manage finances across 150+ currencies with automatic exchange rate updates. Transactions are converted to your base currency for reporting while preserving original currency amounts. Perfect for international businesses, remote teams, or clients paying in different currencies. Exchange rate gains and losses are tracked automatically.",
			},
		],
		colorVar: "--module-finance",
		icon: DollarSign,
		useCases: [
			{
				title: "Track all financial transactions in one place",
				description:
					"Connect bank accounts, credit cards, payment processors, and accounting software to see all transactions in one unified view. No more logging into multiple systems or manually consolidating spreadsheets. Get a complete picture of your financial position instantly, whether you're a freelancer tracking personal business finances or a company managing complex multi-entity operations.",
			},
			{
				title: "Create and send professional invoices",
				description:
					"Generate branded invoices quickly using templates, customize them for different clients or project types, and send them directly from Wingmnn. Track which invoices are sent, viewed, and paid. Set up automatic payment reminders for overdue invoices. Integration with payment gateways allows clients to pay directly, reducing payment time from weeks to days.",
			},
			{
				title: "Streamline approval processes",
				description:
					"Define approval workflows that route expenses, invoices, or payments to the right approvers based on amount thresholds, categories, or projects. Approvers get notifications and can approve or reject with comments. All approvals are logged for audit trails. This is especially valuable for teams where multiple people can spend but approvals are required, ensuring proper financial controls without slowing down operations.",
			},
			{
				title: "Forecast cashflow with AI insights",
				description:
					"Use AI to predict future cashflow based on historical patterns, recurring revenue, scheduled payments, and seasonal trends. Identify potential cashflow gaps weeks or months in advance, allowing you to plan for financing needs, adjust spending, or accelerate collections. The system learns from your business patterns to improve forecast accuracy over time, helping you make better financial decisions.",
			},
			{
				title: "Manage multi-currency operations",
				description:
					"If you work with international clients, remote team members, or have expenses in different currencies, Wingmnn handles it all. Transactions are automatically converted using current exchange rates, and you can see reports in your base currency while preserving original amounts. Track currency gains and losses, and understand the true cost of international operations.",
			},
		],
		benefits: [
			{
				title: "Real-time financial visibility",
				description:
					"See your complete financial picture at any moment with real-time data from all connected accounts. No more waiting for monthly statements or manually updating spreadsheets. Make informed decisions based on current data, not last month's numbers. This visibility helps you catch issues early, identify opportunities, and maintain better control over your finances.",
			},
			{
				title: "Faster invoice processing",
				description:
					"Create, send, and track invoices in one system, reducing the time from hours to minutes. Automated reminders mean you don't have to manually follow up on overdue invoices. Integration with payment processors allows instant payment, reducing days sales outstanding by an average of 40%. This faster processing improves cashflow and reduces administrative overhead.",
			},
			{
				title: "Better cashflow management",
				description:
					"With accurate forecasting and real-time visibility, you can manage cashflow proactively instead of reactively. Identify potential shortfalls early and take action before they become problems. Understand seasonal patterns and plan accordingly. Better cashflow management means less stress, fewer financing needs, and more opportunities to invest in growth.",
			},
			{
				title: "Automated expense categorization",
				description:
					"Reduce manual data entry by 80% with AI-powered categorization that learns from your patterns. Transactions are automatically sorted into the right categories, making accounting reconciliation faster and more accurate. This saves hours every month while reducing errors. The system gets smarter over time, requiring fewer manual corrections.",
			},
		],
		integrations: ["Banking APIs", "Stripe", "PayPal", "QuickBooks", "Xero"],
		stats: [
			{ label: "Invoice Processing", value: "3x faster" },
			{ label: "Forecast Accuracy", value: "95%+" },
			{ label: "Currencies", value: "150+" },
		],
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Finance module and connect your financial accounts. Wingmnn supports direct bank connections via secure APIs, integration with payment processors like Stripe and PayPal, and sync with accounting software like QuickBooks and Xero. The setup wizard guides you through each connection with bank-level security. Once connected, transactions start flowing in automatically.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Set up your financial workflows by creating invoice templates, defining approval rules, configuring expense categories, and setting up cashflow forecasting preferences. Connect payment processors for invoice payments, set up automatic categorization rules, and configure multi-currency settings if needed. The AI categorization engine starts learning immediately from your transaction patterns.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As you use the Finance module, the system becomes smarter about your business patterns. Review forecasts regularly and adjust based on insights. Add more accounts as your business grows, create additional invoice templates for different client types, and refine approval workflows. Use analytics to understand spending patterns, identify cost-saving opportunities, and optimize cashflow management.",
			},
		],
	},
	{
		name: "Feeds",
		slug: "feeds",
		description: "Digest company activity and curated industry intel.",
		detailedDescription:
			"Stay informed without the noise. Our feeds module aggregates company activity, industry news, and curated intelligence into digestible streams. Customize what you see and when, so you're always in the know without feeling overwhelmed.",
		features: [
			{
				title: "Company activity feed",
				description:
					"See all team activities in one unified feed—project updates, file changes, new notes, calendar events, and more. Get a real-time pulse of what's happening across your organization without checking multiple tools. Filter by team, project, or activity type to focus on what matters to you.",
			},
			{
				title: "Curated industry news",
				description:
					"Stay ahead with AI-curated industry news from trusted sources. The system learns your interests and surfaces relevant articles, trends, and insights. Sources are verified for quality, and you can customize which topics and publications you follow. Never miss important industry developments that could impact your work.",
			},
			{
				title: "Customizable filters",
				description:
					"Create custom filters to control exactly what appears in your feed. Filter by source, topic, author, date, or keywords. Set up multiple feed views for different contexts—one for morning news, another for team updates, and a third for industry research. Save filters as presets for quick access.",
			},
			{
				title: "Smart prioritization",
				description:
					"AI automatically prioritizes content based on relevance, recency, and your reading patterns. Important updates rise to the top, while less critical items are organized below. The system learns what you engage with most and adjusts prioritization accordingly, ensuring you see the most valuable content first.",
			},
			{
				title: "Read-it-later functionality",
				description:
					"Save interesting articles, posts, or updates to read later with one click. Your reading list is organized and searchable, making it easy to catch up when you have time. Set reminders for saved items, or let the system suggest when to review your reading list based on your schedule.",
			},
			{
				title: "Share and bookmark articles",
				description:
					"Easily share articles and updates with your team or bookmark them for future reference. Share with context, add notes, or create collections around specific topics. Bookmarked items are organized and searchable, building a personal knowledge repository over time.",
			},
		],
		colorVar: "--module-feeds",
		icon: Rss,
		useCases: [
			{
				title: "Stay updated on team activities",
				description:
					"Get a real-time view of what your team is working on without interrupting them with questions. See when projects are updated, files are shared, meetings are scheduled, or milestones are reached. This is especially valuable for managers, stakeholders, or distributed teams who need visibility without constant check-ins.",
			},
			{
				title: "Follow industry news and trends",
				description:
					"Keep up with industry developments, competitor news, and market trends without spending hours browsing news sites. The AI curates relevant articles from trusted sources, learns your interests, and surfaces the most important updates. Perfect for staying competitive and informed in fast-moving industries.",
			},
			{
				title: "Curate personalized information streams",
				description:
					"Create custom feeds tailored to your role, interests, or current projects. Set up different feeds for different purposes—morning briefings, competitor monitoring, industry research, or team updates. Each feed can have its own filters, sources, and prioritization rules, giving you complete control over your information diet.",
			},
			{
				title: "Save articles for later reading",
				description:
					"When you see something interesting but don't have time to read it, save it to your reading list. The system organizes saved items and makes them easy to find later. Set aside dedicated time for reading, or let the system suggest optimal times based on your schedule. Never lose track of valuable content.",
			},
			{
				title: "Share insights with your team",
				description:
					"Easily share relevant articles, updates, or insights with team members. Add context or notes when sharing, and recipients can save items to their own reading lists. This helps spread knowledge across the team and ensures important information doesn't get siloed. Perfect for research teams, consultants, or knowledge workers.",
			},
		],
		benefits: [
			{
				title: "Stay informed without information overload",
				description:
					"By aggregating and prioritizing content intelligently, you get the information you need without drowning in noise. The AI filters out irrelevant content and surfaces what matters, saving you hours of browsing while ensuring you don't miss important updates. This balance between being informed and being overwhelmed is crucial for productivity.",
			},
			{
				title: "Customize your information diet",
				description:
					"Take control of what information you consume and when. Create feeds that match your workflow—morning briefings, afternoon deep-dives, or weekly summaries. This customization means you're always informed about what matters to you, without irrelevant content cluttering your attention. A well-curated information diet improves decision-making and reduces stress.",
			},
			{
				title: "Never miss important updates",
				description:
					"With smart prioritization and customizable notifications, important updates always surface when you need them. Whether it's a critical team announcement, breaking industry news, or a project milestone, the system ensures you see it. This reliability means you can trust the system to keep you informed, reducing the need to constantly check multiple sources.",
			},
			{
				title: "Build a knowledge repository",
				description:
					"Over time, your saved articles, bookmarks, and shared content build into a valuable knowledge repository. Everything is searchable and organized, making it easy to find information when you need it. This repository becomes more valuable as it grows, helping you and your team leverage accumulated knowledge for better decision-making.",
			},
		],
		integrations: ["RSS Feeds", "News APIs", "Social Media", "Custom Sources"],
		stats: [
			{ label: "Sources", value: "Unlimited" },
			{ label: "Filter Options", value: "50+" },
			{ label: "Time Saved", value: "1 hr/day" },
		],
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Feeds module and connect your information sources. Add RSS feeds, connect news APIs, integrate social media accounts, or set up custom sources. The setup wizard helps you configure each source with authentication and preferences. Once connected, content starts flowing into your unified feed immediately.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Customize your feeds by creating filters, setting up prioritization rules, and organizing sources into different feed views. Set notification preferences for different types of content, create reading lists, and configure sharing settings. The AI starts learning your preferences immediately, but you can fine-tune it by marking content as important or irrelevant.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As you use the Feeds module, the system becomes smarter about what content is relevant to you. Add more sources as your interests evolve, create additional feed views for different contexts, and build your knowledge repository by saving and bookmarking valuable content. Use analytics to understand your reading patterns and optimize your information consumption.",
			},
		],
	},
	{
		name: "Messages",
		slug: "messages",
		description: "Secure DMs plus async voice & video drops.",
		detailedDescription:
			"Communicate on your own terms. Send secure direct messages, or drop async voice and video notes when typing isn't enough. All conversations are encrypted and searchable, so nothing gets lost in the shuffle.",
		features: [
			{
				title: "End-to-end encrypted messaging",
				description:
					"All messages are encrypted end-to-end, meaning only you and the recipient can read them. Even Wingmnn can't access your message content. This enterprise-grade security ensures sensitive conversations, proprietary information, and personal communications remain private. Perfect for teams handling confidential data or working in regulated industries.",
			},
			{
				title: "Async voice and video drops",
				description:
					"Sometimes typing isn't enough. Record voice or video messages when you need to convey tone, demonstrate something, or just communicate more naturally. These async drops work across time zones—record when it's convenient for you, and recipients can listen or watch when it's convenient for them. No scheduling needed, no interruptions.",
			},
			{
				title: "Threaded conversations",
				description:
					"Keep conversations organized with threading. Reply to specific messages to create threaded discussions that stay contextually linked. This makes it easy to follow multiple topics in the same channel, track decision-making processes, and find relevant context later. Threads reduce notification noise while keeping important discussions accessible.",
			},
			{
				title: "Message search and archives",
				description:
					"Search through all your message history instantly with full-text search that understands context, not just keywords. Find specific conversations, decisions, or information from months or years ago. All messages are archived indefinitely, so nothing is ever truly lost. Search by sender, date, content, or even files shared in conversations.",
			},
			{
				title: "Reaction and reply features",
				description:
					"React to messages with emojis for quick acknowledgment without cluttering the conversation. Reply to specific messages to create threaded discussions. These features make communication more efficient—react when a simple acknowledgment is enough, reply when you need to add context or continue a discussion.",
			},
			{
				title: "File and media sharing",
				description:
					"Share files, images, videos, and documents directly in conversations. Files up to 10GB are supported, with automatic compression for images and videos. All shared files are encrypted and stored securely. Preview files without downloading, and access shared files from the conversation context. Perfect for collaborative work where files and discussions go together.",
			},
		],
		colorVar: "--module-messages",
		icon: MessageSquare,
		useCases: [
			{
				title: "Secure team communication",
				description:
					"Communicate with your team knowing that all messages are encrypted end-to-end. This is essential for teams handling sensitive information, working in regulated industries, or simply valuing privacy. Whether discussing strategy, sharing proprietary information, or coordinating work, your conversations remain secure and private.",
			},
			{
				title: "Send voice notes when typing isn't enough",
				description:
					"When you need to convey tone, explain something complex, or just communicate more naturally, use voice notes. Record a quick voice message instead of typing a long explanation. This is especially valuable for remote teams where written communication can sometimes feel impersonal, or when explaining something that's easier to demonstrate verbally.",
			},
			{
				title: "Record video updates asynchronously",
				description:
					"Record video updates, demos, or explanations that team members can watch when convenient. Perfect for async standups, project updates, or sharing screen recordings. No need to schedule video calls across time zones—record when it works for you, and recipients watch when it works for them. This flexibility is crucial for distributed teams.",
			},
			{
				title: "Search through message history",
				description:
					"Find any conversation, decision, or piece of information from your message history with powerful search. Search by keywords, sender, date, or even content within shared files. This is invaluable when you need to recall a past decision, find a shared document, or understand the context of a previous discussion. Never lose track of important information shared in conversations.",
			},
			{
				title: "Share files and media securely",
				description:
					"Share files directly in conversations where the context is clear. Files are encrypted, stored securely, and accessible from the conversation thread. Preview files without downloading, and all shared files are searchable. This makes collaborative work seamless—discuss a document while sharing it, or share screenshots with explanations, all in one place.",
			},
		],
		benefits: [
			{
				title: "End-to-end encryption for security",
				description:
					"Enterprise-grade security ensures your communications remain private. This is crucial for teams handling sensitive data, working in regulated industries, or simply valuing privacy. The encryption means even if data is intercepted, it can't be read. This security gives you confidence to communicate freely about sensitive topics.",
			},
			{
				title: "Flexible communication options",
				description:
					"Choose the right communication method for each situation—text for quick updates, voice for explanations, video for demos. This flexibility means you can communicate effectively regardless of the situation. Async options mean you don't have to interrupt your work or schedule calls, making communication more efficient and less disruptive.",
			},
			{
				title: "Never lose important messages",
				description:
					"With unlimited message history and powerful search, important information is never lost. Find past decisions, shared files, or context from months or years ago. This permanence means you can reference past conversations, understand decision history, and maintain institutional knowledge even as team members change.",
			},
			{
				title: "Work across time zones easily",
				description:
					"Async communication options make working across time zones seamless. Send messages, voice notes, or video updates when it's convenient for you, and recipients can respond when it's convenient for them. No more scheduling calls at inconvenient times or waiting for overlapping hours. This flexibility is essential for distributed teams.",
			},
		],
		integrations: ["Slack", "Teams", "Discord", "WhatsApp Business"],
		stats: [
			{ label: "Encryption", value: "E2E" },
			{ label: "Message History", value: "Unlimited" },
			{ label: "File Size", value: "10GB max" },
		],
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Messages module and invite your team members. Each team member gets their own secure account with end-to-end encryption. You can start messaging immediately, and the system handles all encryption and security automatically. Connect integrations with Slack, Teams, or Discord if you want to bridge existing communication channels.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Set up notification preferences, configure file sharing limits, and customize your messaging experience. Set up channels or direct message preferences, configure search settings, and enable integrations with other tools. The system is ready to use immediately, but you can customize it to match your team's communication style and preferences.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As your team grows and uses Messages more, the searchable archive becomes increasingly valuable. Use search to find past decisions, reference conversations, and maintain institutional knowledge. Add more team members, create additional channels for different projects or topics, and leverage the async communication features to work efficiently across time zones.",
			},
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
			{
				title: "Smart meeting scheduling",
				description:
					"AI suggests optimal meeting times based on everyone's availability, time zones, and preferences. No more back-and-forth emails trying to find a time that works. The system considers work hours, existing meetings, buffer time preferences, and even travel time between meetings. Schedule meetings in seconds instead of minutes.",
			},
			{
				title: "Team availability sync",
				description:
					"See real-time availability for your entire team in one view. Know who's free, who's busy, and who's out of office without asking. This visibility makes scheduling easier and helps you respect team members' time. Availability syncs automatically from all connected calendars, so the view is always current.",
			},
			{
				title: "Deadline and milestone tracking",
				description:
					"Track project deadlines and milestones alongside your calendar events. Set up deadline reminders, visualize timelines, and see how deadlines relate to your scheduled work. Integration with the Projects module means deadlines automatically appear in your calendar, and you can see project context when scheduling work.",
			},
			{
				title: "External calendar integration",
				description:
					"Sync with Google Calendar, Outlook, Apple Calendar, and any CalDAV-compatible calendar. All your events appear in one place, and changes sync bidirectionally in real-time. This means you can use Wingmnn as your primary calendar while keeping everything in sync with your existing calendar apps.",
			},
			{
				title: "Automated reminders",
				description:
					"Never miss a meeting or deadline with smart reminders. Set custom reminder times for different types of events, and the system sends notifications via your preferred channels. Reminders consider your schedule—if you're already in a meeting, they might come earlier. Context-aware reminders help you prepare appropriately.",
			},
			{
				title: "Recurring event management",
				description:
					"Set up recurring meetings, standups, or rituals with flexible recurrence rules. Weekly team standups, monthly reviews, or custom patterns—all handled automatically. Changes to recurring events can apply to all future instances or just one, giving you flexibility while maintaining consistency.",
			},
		],
		colorVar: "--module-calendar",
		icon: Calendar,
		useCases: [
			{
				title: "Schedule meetings with smart time suggestions",
				description:
					"When you need to schedule a meeting, the system analyzes everyone's calendars and suggests optimal times. It considers time zones, work hours, existing commitments, and even preferences like avoiding early mornings or late evenings. This eliminates the back-and-forth of finding a time, saving everyone involved significant time and reducing scheduling friction.",
			},
			{
				title: "Track project deadlines and milestones",
				description:
					"See all project deadlines and milestones in your calendar alongside meetings and events. This unified view helps you plan your time effectively, see conflicts between deadlines and meetings, and ensure you're allocating enough time for important work. Integration with the Projects module means deadlines automatically appear and stay in sync.",
			},
			{
				title: "Sync with Google Calendar, Outlook, and more",
				description:
					"Keep all your calendars in sync automatically. Whether you use Google Calendar for personal events, Outlook for work, or Apple Calendar on your devices, everything syncs bidirectionally in real-time. This means you can use your preferred calendar app while still benefiting from Wingmnn's smart scheduling and team features.",
			},
			{
				title: "Never double-book with availability sync",
				description:
					"Real-time availability sync means you can see when team members are free before scheduling. The system also prevents double-booking by checking all connected calendars. If someone's calendar shows they're busy, you'll see it immediately. This visibility and protection ensure smoother scheduling and fewer conflicts.",
			},
			{
				title: "Set up recurring team rituals",
				description:
					"Establish team rituals like daily standups, weekly reviews, or monthly planning sessions with recurring events. Set them up once, and they're scheduled automatically. Team members can see the full series, and you can adjust individual instances if needed. This consistency helps build team rhythm and ensures important rituals don't get forgotten.",
			},
		],
		benefits: [
			{
				title: "Save time with smart scheduling",
				description:
					"AI-powered scheduling suggestions eliminate the time-consuming back-and-forth of finding meeting times. What used to take multiple emails and several minutes now takes seconds. The system considers everyone's availability, time zones, and preferences automatically, reducing scheduling overhead by 80% on average. This time savings adds up quickly for busy teams.",
			},
			{
				title: "Never miss important deadlines",
				description:
					"With deadlines visible in your calendar alongside meetings, and automated reminders, you'll never miss an important deadline. The system helps you see conflicts between deadlines and scheduled work, allowing you to plan ahead. This visibility and proactive reminders reduce stress and improve on-time delivery rates.",
			},
			{
				title: "Seamless calendar synchronization",
				description:
					"Bidirectional sync with external calendars means everything stays in sync automatically. You can use your preferred calendar app while still benefiting from Wingmnn's features. Changes made in Wingmnn appear in your other calendars, and vice versa. This seamless integration means you don't have to choose between tools—they all work together.",
			},
			{
				title: "Better time management",
				description:
					"Seeing all your commitments—meetings, deadlines, and events—in one unified view helps you manage your time more effectively. You can see your schedule at a glance, identify free time, and plan work accordingly. The smart scheduling features help you avoid overcommitting and ensure you have buffer time between meetings. Better time management leads to less stress and higher productivity.",
			},
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
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Calendar module and connect your existing calendars. Wingmnn supports Google Calendar, Outlook, Apple Calendar, and any CalDAV-compatible calendar. The setup wizard guides you through authentication for each calendar. Once connected, all your events start syncing automatically in real-time, appearing in your unified Wingmnn calendar.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Set up your calendar preferences including work hours, time zone, reminder preferences, and availability settings. Configure smart scheduling preferences like buffer time between meetings, preferred meeting times, and time zone handling. Set up recurring events for team rituals, and customize how deadlines from the Projects module appear in your calendar.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As you use the Calendar module, the smart scheduling AI learns your preferences and gets better at suggesting optimal times. Add more calendar integrations as needed, create additional calendar views for different purposes, and leverage the deadline tracking to better manage your time. Use analytics to understand your meeting patterns and optimize your schedule.",
			},
		],
	},
	{
		name: "Wellness",
		slug: "wellness",
		description: "Micro-check-ins, focus playlists, burnout alerts.",
		detailedDescription:
			"Take care of your team's wellbeing. Regular micro-check-ins help you spot burnout before it becomes a problem. Curated focus playlists keep everyone in the zone, and smart alerts ensure work-life balance stays balanced.",
		features: [
			{
				title: "Daily micro-check-ins",
				description:
					"Quick, non-intrusive daily check-ins take just seconds but provide valuable insights into team wellbeing. Team members answer a few simple questions about energy, stress, and satisfaction. The data is aggregated and anonymized for privacy, giving managers visibility into team health without invading individual privacy. These micro-check-ins are designed to be fast and easy, ensuring high participation rates.",
			},
			{
				title: "Curated focus playlists",
				description:
					"Access 100+ curated playlists designed for different work contexts—deep focus, creative work, energy boost, or relaxation. Playlists are created by music experts and optimized for productivity. Integration with Spotify and Apple Music means you can listen directly in Wingmnn or in your preferred music app. The right music can significantly improve focus and productivity.",
			},
			{
				title: "Burnout detection alerts",
				description:
					"AI analyzes check-in patterns, work hours, and other signals to detect early signs of burnout before it becomes a serious problem. When concerning patterns are detected, alerts are sent to team leads (with privacy protections) so they can intervene early. Early detection means you can address issues before they lead to turnover or serious health problems.",
			},
			{
				title: "Wellness insights and trends",
				description:
					"See wellness trends over time with detailed analytics. Understand how team wellbeing changes with seasons, projects, or workload. Identify patterns that correlate with better or worse wellbeing, and use these insights to make data-driven decisions about work practices, deadlines, or team structure. These insights help you create a healthier work environment.",
			},
			{
				title: "Team wellness dashboard",
				description:
					"Managers get a comprehensive dashboard showing team wellness metrics while respecting individual privacy. See aggregate trends, identify teams or individuals who might need support, and track the impact of wellness initiatives. The dashboard helps you understand team health at a glance and make informed decisions about workload, deadlines, or support needs.",
			},
			{
				title: "Personal wellness goals",
				description:
					"Team members can set personal wellness goals like taking regular breaks, maintaining work-life boundaries, or improving sleep. The system tracks progress and sends gentle reminders. Goals are private by default, but team members can share progress if they choose. This personalization helps individuals take ownership of their wellbeing while the team benefits from healthier members.",
			},
		],
		colorVar: "--module-wellness",
		icon: Heart,
		useCases: [
			{
				title: "Monitor team wellbeing with daily check-ins",
				description:
					"Get a real-time pulse on team wellbeing through quick daily check-ins. These take just seconds but provide valuable data about energy levels, stress, and satisfaction. The aggregated, anonymized data gives managers visibility into team health trends without invading privacy. This visibility helps you catch problems early and make informed decisions about workload, deadlines, or support needs.",
			},
			{
				title: "Detect burnout early with AI analysis",
				description:
					"The AI analyzes check-in patterns, work hours, response times, and other signals to detect early warning signs of burnout. When concerning patterns emerge, alerts are sent to team leads so they can intervene proactively. Early detection means you can address issues before they lead to serious problems, turnover, or health issues. This proactive approach saves both the individual and the organization.",
			},
			{
				title: "Boost focus with curated music playlists",
				description:
					"Access scientifically-curated playlists designed for different work contexts. Whether you need deep focus music, creative inspiration, or an energy boost, there's a playlist for it. Integration with Spotify and Apple Music means seamless listening. The right music can significantly improve focus, productivity, and mood, making this a simple but powerful wellness tool.",
			},
			{
				title: "Track wellness trends over time",
				description:
					"See how team wellbeing changes over time with detailed analytics. Understand seasonal patterns, the impact of project deadlines, or how team changes affect wellness. These insights help you make data-driven decisions about work practices, identify what's working, and adjust when needed. Long-term tracking helps you build a healthier, more sustainable work culture.",
			},
			{
				title: "Set and achieve personal wellness goals",
				description:
					"Team members can set personal wellness goals and track progress privately. Goals might include taking regular breaks, maintaining work-life boundaries, improving sleep, or reducing stress. The system sends gentle reminders and tracks progress. This personalization helps individuals take ownership of their wellbeing while respecting privacy. Healthier team members mean a healthier, more productive team.",
			},
		],
		benefits: [
			{
				title: "Early burnout detection",
				description:
					"By detecting burnout signs early, you can intervene before problems become serious. This proactive approach prevents turnover, reduces healthcare costs, and maintains team productivity. Early intervention is much more effective than waiting until someone is already burned out. The system's AI patterns help you catch issues that might not be obvious in day-to-day interactions.",
			},
			{
				title: "Improved team morale",
				description:
					"When team members feel their wellbeing is valued and supported, morale improves. The Wellness module shows that the organization cares about more than just output—it cares about people. This investment in wellbeing creates a positive culture where people want to work, leading to better retention, higher engagement, and improved performance.",
			},
			{
				title: "Better work-life balance",
				description:
					"By tracking work patterns, sending reminders about breaks, and helping team members set boundaries, the Wellness module actively promotes better work-life balance. The insights help both individuals and managers understand when work is encroaching on personal time. Better balance means happier, healthier team members who perform better and stay longer.",
			},
			{
				title: "Data-driven wellness insights",
				description:
					"Instead of guessing about team wellbeing, you have data. See trends, identify patterns, and understand what factors correlate with better or worse wellbeing. These insights help you make informed decisions about work practices, deadlines, team structure, or wellness initiatives. Data-driven decisions are more effective than intuition alone.",
			},
		],
		integrations: ["Spotify", "Apple Music", "Health Apps", "Fitness Trackers"],
		stats: [
			{ label: "Burnout Detection", value: "Early" },
			{ label: "Check-in Response", value: "90%+" },
			{ label: "Playlists", value: "100+" },
		],
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Wellness module and invite your team to participate. Team members can opt in to daily check-ins, which take just seconds. Connect music integrations like Spotify or Apple Music if you want access to focus playlists. The system starts collecting wellness data immediately, and the AI begins learning patterns to detect early warning signs.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Set up check-in preferences, configure burnout detection thresholds, and customize wellness goals. Managers can set up team wellness dashboards and configure privacy settings. Connect health apps or fitness trackers if team members want to integrate additional wellness data. Set up playlists for different work contexts and customize the wellness experience for your team.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As you use the Wellness module, the AI becomes smarter at detecting patterns and providing insights. Review wellness trends regularly to understand team health and identify areas for improvement. Use insights to make data-driven decisions about work practices, deadlines, or team structure. The more data you collect, the more valuable the insights become for building a healthier work culture.",
			},
		],
	},
	{
		name: "Projects",
		slug: "projects",
		description: "Roadmaps, tasks, and rituals tied to outcomes.",
		detailedDescription:
			"Ship faster with clarity. Build roadmaps that connect to real outcomes, break work into actionable tasks, and establish rituals that keep your team aligned. Every project ties back to measurable results.",
		features: [
			{
				title: "Visual roadmaps",
				description:
					"Create beautiful, interactive roadmaps that show how work connects to outcomes. Visualize timelines, dependencies, and milestones in an intuitive interface. Roadmaps can be shared with stakeholders, updated in real-time, and linked directly to tasks. This visual clarity helps everyone understand the big picture and how their work contributes to goals.",
			},
			{
				title: "Task management and tracking",
				description:
					"Break projects into actionable tasks with clear ownership, deadlines, and dependencies. Track task status, see who's working on what, and understand progress at a glance. Integration with other modules means tasks can be created from emails, notes, or calendar events. Task tracking ensures nothing falls through the cracks and everyone knows what to work on next.",
			},
			{
				title: "Outcome-based planning",
				description:
					"Connect all work to measurable outcomes, not just activities. Define success metrics for each project, and track progress toward those outcomes. This outcome-focused approach ensures you're building the right things, not just staying busy. When outcomes are clear, prioritization becomes easier and decision-making improves.",
			},
			{
				title: "Team rituals and standups",
				description:
					"Establish team rituals like daily standups, weekly reviews, or sprint planning directly in the Projects module. These rituals can be async or sync, and they're integrated with task tracking so updates flow automatically. Rituals help maintain team alignment, surface blockers early, and create consistent communication rhythms.",
			},
			{
				title: "Progress analytics",
				description:
					"Get real-time insights into project progress with detailed analytics. See velocity trends, completion rates, time-to-completion metrics, and outcome progress. These analytics help you understand what's working, identify bottlenecks, and make data-driven decisions about resource allocation or process improvements.",
			},
			{
				title: "Resource allocation and capacity planning",
				description:
					"See team capacity at a glance and allocate resources effectively. Understand who's available, who's at capacity, and how work is distributed. This visibility helps prevent overloading team members, ensures balanced workloads, and makes it easier to plan new projects or adjust timelines based on actual capacity.",
			},
		],
		colorVar: "--module-projects",
		icon: FolderKanban,
		useCases: [
			{
				title: "Create visual roadmaps tied to outcomes",
				description:
					"Build roadmaps that show not just what you're building, but why. Connect features and milestones to business outcomes, customer value, or strategic goals. This outcome-focused approach helps teams understand priorities, make better decisions, and stay aligned on what matters. Visual roadmaps make it easy to communicate plans to stakeholders and adjust as priorities change.",
			},
			{
				title: "Break down projects into actionable tasks",
				description:
					"Take large projects and break them into manageable, actionable tasks. Each task has clear ownership, deadlines, and can be linked to outcomes. This breakdown makes complex projects feel achievable and helps teams make steady progress. Task tracking ensures nothing is forgotten and everyone knows what to work on next.",
			},
			{
				title: "Track progress with real-time analytics",
				description:
					"See how projects are progressing with real-time analytics. Track velocity, completion rates, time-to-completion, and progress toward outcomes. These metrics help you understand if you're on track, identify bottlenecks early, and make data-driven decisions about timelines or resource allocation. Real-time visibility means you can adjust quickly when needed.",
			},
			{
				title: "Plan resources and capacity",
				description:
					"See team capacity and allocate resources effectively before committing to new work. Understand who's available, who's at capacity, and how work is distributed across the team. This visibility helps prevent overloading team members, ensures balanced workloads, and makes it easier to plan realistically. Better capacity planning means more accurate timelines and less stress.",
			},
			{
				title: "Establish team rituals and standups",
				description:
					"Create consistent team rituals like daily standups, weekly reviews, or sprint planning. These rituals can be async or sync, and they're integrated with task tracking so updates flow automatically. Rituals help maintain alignment, surface blockers early, and create predictable communication rhythms that keep teams coordinated.",
			},
		],
		benefits: [
			{
				title: "Ship 30% faster with clear roadmaps",
				description:
					"When teams have clear roadmaps that connect work to outcomes, they can move faster. Clarity reduces confusion, eliminates unnecessary work, and helps teams prioritize effectively. Teams using outcome-based roadmaps report shipping 30% faster on average because they're building the right things and staying aligned on priorities. This speed improvement comes from better focus, not from working harder.",
			},
			{
				title: "Better resource planning",
				description:
					"With visibility into team capacity and workload distribution, you can plan resources more effectively. See who's available for new projects, prevent overloading team members, and balance work across the team. Better resource planning means more accurate timelines, less stress, and higher quality work. It also helps you make informed decisions about hiring or project commitments.",
			},
			{
				title: "Outcome-focused execution",
				description:
					"By connecting all work to measurable outcomes, teams stay focused on what matters. This outcome-focused approach ensures you're building the right things, not just staying busy. When outcomes are clear, prioritization becomes easier, decision-making improves, and teams can say no to work that doesn't contribute to goals. This focus leads to better results and higher satisfaction.",
			},
			{
				title: "Improved team alignment",
				description:
					"Visual roadmaps, clear tasks, and regular rituals keep teams aligned on goals, priorities, and progress. Everyone understands how their work contributes to outcomes, what others are working on, and where the project is heading. This alignment reduces confusion, prevents duplicate work, and helps teams move in the same direction. Better alignment means better results.",
			},
		],
		integrations: ["Jira", "Asana", "Linear", "GitHub", "GitLab", "Trello"],
		stats: [
			{ label: "Ship Speed", value: "30% faster" },
			{ label: "Task Completion", value: "95%+" },
			{ label: "Team Alignment", value: "100%" },
		],
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Projects module and create your first project. Define the outcome you're working toward, then start building your roadmap. Break the project into tasks, assign owners, and set deadlines. Connect integrations with tools like Jira, GitHub, or Linear if you want to sync with existing workflows. The system is ready to use immediately.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Set up team rituals like standups or reviews, configure analytics preferences, and customize your workflow. Set up resource capacity tracking, define outcome metrics, and configure integrations. Create templates for common project types to speed up setup. The system adapts to how you work, whether you prefer agile, waterfall, or custom methodologies.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As you use the Projects module, use analytics to understand what's working and optimize your processes. Review progress regularly, adjust roadmaps based on learnings, and refine your rituals. Add more projects as your team grows, and leverage the outcome-focused approach to ensure you're always building the right things. The more you use it, the more valuable the insights become.",
			},
		],
	},
	{
		name: "Files",
		slug: "files",
		description: "Versioned handoffs with smart organization.",
		detailedDescription:
			"Never lose a file again. Every document is versioned automatically, making it easy to see what changed and when. Smart organization helps you find what you need instantly, and seamless handoffs ensure smooth collaboration.",
		features: [
			{
				title: "Automatic versioning",
				description:
					"Every file change is automatically saved as a new version, creating a complete history of all changes. See who changed what and when, compare versions side-by-side, or revert to any previous version. This automatic versioning means you never lose work, even if someone accidentally overwrites a file. The complete history is preserved indefinitely, giving you confidence to edit freely.",
			},
			{
				title: "Smart file organization",
				description:
					"AI-powered organization automatically suggests folders, tags, and relationships between files. The system learns from your organization patterns and suggests where new files should go. Smart folders automatically collect files based on criteria you define. This intelligent organization means files are easy to find even as your collection grows, without requiring manual organization effort.",
			},
			{
				title: "Seamless handoffs",
				description:
					"Transfer file ownership or share files with team members seamlessly. When you hand off a file, the new owner gets full context including version history, related files, and notes. Handoffs can include automatic notifications and access updates. This smooth transfer process ensures continuity when team members change or work moves between people.",
			},
			{
				title: "Full-text search",
				description:
					"Search through file contents, not just filenames. Full-text search indexes the content of documents, PDFs, images (with OCR), and more. Find files by searching for content you remember, even if you don't remember the filename. Search results appear in under a second, making it easy to find what you need quickly, even in large file collections.",
			},
			{
				title: "Access control and permissions",
				description:
					"Control who can view, edit, or share files with granular permissions. Set permissions at the file, folder, or team level. Permissions can be inherited or overridden as needed. This fine-grained control ensures sensitive files stay secure while making collaboration easy for files that should be shared. Perfect for teams handling confidential information or working with external partners.",
			},
			{
				title: "Cloud storage integration",
				description:
					"Sync with Google Drive, Dropbox, OneDrive, Box, or Amazon S3. Files stored in external cloud storage appear in Wingmnn with full versioning and search capabilities. Changes sync bidirectionally, so you can use your preferred cloud storage while benefiting from Wingmnn's organization and collaboration features. This integration means you don't have to migrate files—they work together seamlessly.",
			},
		],
		colorVar: "--module-files",
		icon: Folder,
		useCases: [
			{
				title: "Never lose files with automatic versioning",
				description:
					"Every file change is automatically saved as a new version, creating a complete history. If someone accidentally overwrites a file, deletes important content, or makes unwanted changes, you can revert to any previous version instantly. This automatic versioning means you never lose work, even in worst-case scenarios. The complete history is preserved indefinitely, giving you confidence to edit freely.",
			},
			{
				title: "Find files instantly with smart search",
				description:
					"Search through file contents, not just filenames, to find what you need in under a second. Full-text search indexes documents, PDFs, images (with OCR), and more. Search for content you remember, even if you don't remember the filename or where it's stored. This powerful search makes large file collections manageable and ensures you can always find what you need quickly.",
			},
			{
				title: "Hand off work seamlessly between team members",
				description:
					"When work moves between team members, hand off files with full context. The new owner gets version history, related files, notes, and permissions automatically. Handoffs can include notifications and access updates. This smooth transfer process ensures continuity when team members change, projects are reassigned, or work moves between departments. No information is lost in the handoff.",
			},
			{
				title: "Control access with granular permissions",
				description:
					"Set precise permissions for who can view, edit, or share files. Control access at the file, folder, or team level. Permissions can be inherited or overridden as needed. This fine-grained control is essential for teams handling sensitive information, working with external partners, or managing confidential documents. Secure file sharing without sacrificing collaboration.",
			},
			{
				title: "Sync with cloud storage providers",
				description:
					"Keep using your preferred cloud storage (Google Drive, Dropbox, OneDrive, etc.) while benefiting from Wingmnn's features. Files sync bidirectionally, so changes in either system are reflected in both. You get versioning, smart organization, and collaboration features without migrating files. This integration means you can adopt Wingmnn gradually without disrupting existing workflows.",
			},
		],
		benefits: [
			{
				title: "Zero file loss with versioning",
				description:
					"Automatic versioning means you never lose files, even in worst-case scenarios. Accidental deletions, overwrites, or unwanted changes can all be recovered instantly. This safety net gives you confidence to edit freely and collaborate without fear. The complete history is preserved indefinitely, so you can always go back to any previous version. This reliability is invaluable for important documents or collaborative work.",
			},
			{
				title: "Instant file discovery",
				description:
					"Full-text search means you can find files in under a second, even in large collections. Search by content, not just filenames, so you can find files even if you don't remember their exact name or location. This speed and power make large file collections manageable and ensure you can always find what you need quickly. Time saved searching for files adds up to hours every week.",
			},
			{
				title: "Smooth collaboration",
				description:
					"Seamless handoffs, smart organization, and integrated sharing make collaboration effortless. Team members can work on files together, hand off work smoothly, and find related files easily. The system handles versioning, permissions, and organization automatically, so teams can focus on work instead of file management. This smooth collaboration improves productivity and reduces friction.",
			},
			{
				title: "Secure file sharing",
				description:
					"Granular permissions ensure files are shared securely with the right people. Control who can view, edit, or share files at a fine-grained level. This security is essential for sensitive information, confidential documents, or work with external partners. Secure sharing without sacrificing collaboration means you can work confidently knowing files are protected.",
			},
		],
		integrations: ["Google Drive", "Dropbox", "OneDrive", "Box", "Amazon S3"],
		stats: [
			{ label: "Version History", value: "Unlimited" },
			{ label: "Search Speed", value: "<1s" },
			{ label: "Storage", value: "Unlimited" },
		],
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Files module and connect your cloud storage accounts if you use them. You can start uploading files immediately, or sync existing files from Google Drive, Dropbox, OneDrive, or other providers. The system automatically begins versioning all files and indexing them for search. Smart organization suggestions start appearing as the system learns your patterns.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Set up folder structures, define permission templates, and configure access controls. Set up smart folders that automatically organize files based on criteria you define. Configure search preferences and file type handling. Set up handoff workflows and notification preferences. The system adapts to how you work, whether you prefer strict organization or flexible tagging.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As your file collection grows, the smart organization and search features become increasingly valuable. The AI learns your patterns and gets better at suggesting organization. Use analytics to understand file usage patterns, identify unused files, and optimize your storage. The more files you have, the more valuable the search and organization features become.",
			},
		],
	},
	{
		name: "Fun",
		slug: "fun",
		description: "Team rituals, async games, surprise celebrations.",
		detailedDescription:
			"Work hard, play together. Build team culture with async games, celebrate wins with surprise celebrations, and establish rituals that bring your team closer. Because the best teams are the ones that enjoy working together.",
		features: [
			{
				title: "Async team games",
				description:
					"Play games together asynchronously, perfect for distributed teams across time zones. Choose from 20+ games including trivia, word games, puzzles, and collaborative challenges. Games are designed to be quick and engaging, taking just minutes but building connections. Play at your own pace, and see how your team stacks up on leaderboards. These games create shared experiences that bring teams together.",
			},
			{
				title: "Celebration automation",
				description:
					"Automatically celebrate team wins, milestones, and achievements. When a project ships, a milestone is reached, or someone hits a goal, the system triggers celebrations with confetti, notifications, and team recognition. These automated celebrations ensure wins are never forgotten and team members feel appreciated. Customize celebration types and triggers to match your team's culture.",
			},
			{
				title: "Team rituals and traditions",
				description:
					"Create and maintain team rituals that build culture over time. Whether it's Friday happy hours, monthly team challenges, or annual traditions, the Fun module helps you establish and maintain these rituals. Rituals create shared experiences and memories that strengthen team bonds. They're especially valuable for remote teams who don't have organic in-person interactions.",
			},
			{
				title: "Virtual water cooler",
				description:
					"Create spaces for casual conversation and connection, like a virtual water cooler. Share non-work updates, discuss interests, or just chat. These informal spaces help team members get to know each other as people, not just colleagues. Stronger personal connections lead to better collaboration and a more enjoyable work environment.",
			},
			{
				title: "Team achievements and badges",
				description:
					"Gamify work with achievements and badges for milestones, contributions, or special accomplishments. Team members earn badges for shipping projects, helping colleagues, or participating in team activities. These achievements provide recognition and create a sense of progress and accomplishment. Badges can be displayed on profiles and create friendly competition that motivates engagement.",
			},
			{
				title: "Custom team challenges",
				description:
					"Create custom challenges tailored to your team's interests or goals. Challenges might be work-related (like shipping features) or fun (like fitness goals or creative projects). Team members can participate individually or in groups, and progress is tracked and celebrated. Custom challenges help teams bond around shared goals and create memorable experiences.",
			},
		],
		colorVar: "--module-fun",
		icon: PartyPopper,
		useCases: [
			{
				title: "Build team culture with async games",
				description:
					"Use async games to create shared experiences that build team culture, even when team members are distributed across time zones. Games take just minutes but create connections and memories. Leaderboards create friendly competition, and playing together builds camaraderie. These games are especially valuable for remote teams who don't have organic in-person interactions to build culture.",
			},
			{
				title: "Automatically celebrate team wins",
				description:
					"Set up automated celebrations for project launches, milestone completions, or goal achievements. When something good happens, the system automatically triggers celebrations with confetti, notifications, and team recognition. This ensures wins are never forgotten and team members feel appreciated. Automated celebrations create a culture of recognition and positivity.",
			},
			{
				title: "Create team rituals and traditions",
				description:
					"Establish team rituals that become traditions over time. Whether it's weekly trivia, monthly challenges, or annual events, rituals create shared experiences and memories. The Fun module helps you schedule, organize, and maintain these rituals so they don't get forgotten. These traditions become part of your team's identity and strengthen bonds.",
			},
			{
				title: "Foster connections in virtual teams",
				description:
					"For remote or distributed teams, the Fun module creates opportunities for connection that don't happen naturally. Virtual water coolers, async games, and team challenges help team members get to know each other as people, not just colleagues. These connections improve collaboration, reduce isolation, and create a more enjoyable work environment.",
			},
			{
				title: "Gamify team achievements",
				description:
					"Use achievements and badges to gamify work and recognize contributions. Team members earn badges for shipping projects, helping colleagues, or participating in team activities. These achievements provide recognition, create a sense of progress, and motivate engagement. Gamification makes work more engaging and helps team members feel appreciated for their contributions.",
			},
		],
		benefits: [
			{
				title: "Stronger team bonds",
				description:
					"Shared experiences through games, rituals, and celebrations create stronger bonds between team members. When people have fun together, they build trust and rapport that improves collaboration. Stronger bonds mean better communication, more effective problem-solving, and a more cohesive team. These bonds are especially important for remote teams who don't have in-person interactions.",
			},
			{
				title: "Improved morale",
				description:
					"When teams have fun together and celebrate wins, morale improves. People enjoy coming to work, feel appreciated, and have positive associations with their team. Higher morale leads to better retention, increased engagement, and improved performance. The Fun module creates a positive culture that makes work more enjoyable for everyone.",
			},
			{
				title: "Better remote team culture",
				description:
					"For remote or distributed teams, the Fun module creates culture-building opportunities that don't happen naturally. Async games, virtual water coolers, and team challenges help remote team members connect and build relationships. This is crucial for remote teams who might otherwise feel isolated or disconnected. Better culture means better collaboration and retention.",
			},
			{
				title: "Increased engagement",
				description:
					"Gamification, achievements, and fun activities increase team engagement. When work is enjoyable and team members feel connected, they're more engaged and productive. The Fun module creates engagement through recognition, shared experiences, and positive culture. Higher engagement leads to better performance, lower turnover, and more innovation.",
			},
		],
		integrations: ["Slack", "Discord", "Teams", "Custom Games"],
		stats: [
			{ label: "Team Engagement", value: "85%+" },
			{ label: "Games Available", value: "20+" },
			{ label: "Celebrations", value: "Auto" },
		],
		workflowSteps: [
			{
				title: "Get Started",
				icon: "Sparkles",
				description:
					"Enable the Fun module and invite your team to participate. Set up your first team game or challenge, and configure celebration automation for project milestones. Create a virtual water cooler space for casual conversation. The system is ready to use immediately, and team members can start participating right away. Even small activities can start building team culture.",
			},
			{
				title: "Configure",
				icon: "Zap",
				description:
					"Customize the Fun module to match your team's culture. Set up achievement badges, define celebration triggers, and create custom challenges. Schedule recurring team rituals like weekly games or monthly challenges. Connect integrations with Slack, Discord, or Teams if you want celebrations and notifications in those channels. Make it your own.",
			},
			{
				title: "Scale",
				icon: "TrendingUp",
				description:
					"As your team grows and uses the Fun module, the culture-building effects compound. Review engagement metrics to see what activities resonate most with your team. Add more games, create new challenges, and establish traditions that become part of your team's identity. The more you invest in team culture, the stronger your team becomes.",
			},
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
