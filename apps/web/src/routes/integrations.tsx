import { generateMetadata } from "@/lib/metadata";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Database,
	FileText,
	GitBranch,
	Headphones,
	Layers,
	MessageSquare,
	PlayCircle,
	Shield,
	Users,
	Zap,
} from "lucide-react";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/integrations")({
	component: IntegrationsPage,
	head: () =>
		generateMetadata({
			title: "Wingmnn Integrations",
			description:
				"Connect Wingmnn with every tool your team already uses. CRM, communication, storage, automation, and more.",
			path: "/integrations",
			keywords: [
				"integrations",
				"crm integrations",
				"wingmnn integrations",
				"slack integration",
				"google workspace integration",
				"microsoft 365 integration",
			],
		}),
});

const integrationCategories = [
	{
		icon: MessageSquare,
		title: "Communication & Collaboration",
		description:
			"Keep conversations synced across your favorite communication tools.",
		color: "var(--module-messages)",
		integrations: [
			{
				name: "Slack",
				description: "Mirror channels, link threads, and sync notifications.",
				tag: "Sync",
			},
			{
				name: "Microsoft Teams",
				description: "Surface Wingmnn tasks and meetings inside Teams.",
				tag: "Sync",
			},
			{
				name: "Zoom",
				description: "Auto-create call notes, tasks, and follow-ups.",
				tag: "Notes",
			},
			{
				name: "Google Meet",
				description: "Instant meeting recaps synced into Notes & Tasks.",
				tag: "Notes",
			},
			{
				name: "Discord",
				description:
					"Bring async voice/video and Wingmnn rituals into Discord.",
				tag: "Culture",
			},
			{
				name: "WhatsApp Business",
				description:
					"Mirror key customer chats and route action items into Wingmnn.",
				tag: "Sync",
			},
		],
	},
	{
		icon: FileText,
		title: "Docs & Storage",
		description: "Keep files versioned, searchable, and linked to projects.",
		color: "var(--module-files)",
		integrations: [
			{
				name: "Google Drive",
				description: "Two-way sync with auto-versioning and metadata.",
				tag: "Storage",
			},
			{
				name: "Dropbox",
				description:
					"Keep Dropbox folders in lockstep with Wingmnn workspaces.",
				tag: "Storage",
			},
			{
				name: "OneDrive",
				description: "Permission-aware sync for Microsoft 365 teams.",
				tag: "Storage",
			},
			{
				name: "Box",
				description:
					"Enterprise-ready storage with compliance and audit trails.",
				tag: "Enterprise",
			},
			{
				name: "Notion",
				description: "Embed docs, sync databases, and auto-link decisions.",
				tag: "Docs",
			},
			{
				name: "Confluence",
				description:
					"Sync knowledge bases and keep historical decisions linked to work.",
				tag: "Docs",
			},
		],
	},
	{
		icon: Zap,
		title: "Automation & Workflow",
		description: "Trigger actions and keep data flowing across your stack.",
		color: "var(--module-projects)",
		integrations: [
			{
				name: "Zapier",
				description: "Connect Wingmnn to 5,000+ apps with no code.",
				tag: "Automation",
			},
			{
				name: "Make (Integromat)",
				description: "Build visual automations tied to Wingmnn events.",
				tag: "Automation",
			},
			{
				name: "n8n",
				description: "Self-hosted workflows for custom data movements.",
				tag: "Automation",
			},
			{
				name: "Webhook API",
				description: "Event-based hooks for custom integrations.",
				tag: "Dev",
			},
			{
				name: "IFTTT",
				description: "Lightweight automation for personal workflows.",
				tag: "Personal",
			},
			{
				name: "AWS Lambda",
				description:
					"Trigger custom serverless functions straight from Wingmnn events.",
				tag: "Dev",
			},
		],
	},
	{
		icon: GitBranch,
		title: "Development & Issue Tracking",
		description: "Ship faster with your code and issue trackers in sync.",
		color: "var(--module-messages)",
		integrations: [
			{
				name: "GitHub",
				description:
					"Link PRs to projects, auto-create changelog entries, and review context.",
				tag: "Code",
			},
			{
				name: "GitLab",
				description: "Two-way sync for merge requests and Wingmnn tasks.",
				tag: "Code",
			},
			{
				name: "Jira",
				description: "Bi-directional sync for issues, sprints, and roadmaps.",
				tag: "PM",
			},
			{
				name: "Linear",
				description: "Bring Linear updates directly into Wingmnn rituals.",
				tag: "PM",
			},
			{
				name: "Clubhouse / Shortcut",
				description: "Sync stories, epics, and release notes automatically.",
				tag: "PM",
			},
			{
				name: "Bitbucket",
				description: "Tie repos, deployments, and release notes to rituals.",
				tag: "Code",
			},
		],
	},
	{
		icon: PlayCircle,
		title: "Marketing & Content",
		description:
			"Keep customer messaging and content workflows running smoothly.",
		color: "var(--module-mail)",
		integrations: [
			{
				name: "HubSpot",
				description: "Sync marketing activities, emails, and lifecycle stages.",
				tag: "CRM",
			},
			{
				name: "Mailchimp",
				description: "Bring campaign performance into Wingmnn dashboards.",
				tag: "Email",
			},
			{
				name: "Webflow",
				description:
					"Publish updates, share drafts, and log approvals with product teams.",
				tag: "Web",
			},
			{
				name: "Figma",
				description: "Embed files and track design reviews right in projects.",
				tag: "Design",
			},
			{
				name: "Adobe CC",
				description:
					"Keep creative assets versioned and linked to deliverables.",
				tag: "Design",
			},
			{
				name: "Marketo",
				description:
					"Sync campaign performance, MQLs, and nurture workflows into Wingmnn dashboards.",
				tag: "Automation",
			},
		],
	},
	{
		icon: Database,
		title: "Analytics & Data",
		description: "Build a unified view of work across BI and analytics tools.",
		color: "var(--module-feeds)",
		integrations: [
			{
				name: "Looker",
				description: "Pull dashboards into Wingmnn and tie them to outcomes.",
				tag: "BI",
			},
			{
				name: "Tableau",
				description: "Embed live analytics inside projects and exec reviews.",
				tag: "BI",
			},
			{
				name: "Snowflake",
				description: "Sync metrics & event data for deeper insights.",
				tag: "Data",
			},
			{
				name: "Amplitude",
				description: "Route product signals into roadmaps and rituals.",
				tag: "Product",
			},
			{
				name: "Segment",
				description: "Stream events directly into automations & alerts.",
				tag: "Data",
			},
			{
				name: "Power BI",
				description: "Embed Microsoft BI dashboards next to exec reviews.",
				tag: "BI",
			},
		],
	},
	{
		icon: Shield,
		title: "Security & Compliance",
		description: "Keep Wingmnn aligned with your compliance posture.",
		color: "var(--module-wellness)",
		integrations: [
			{
				name: "Okta",
				description: "SSO, SCIM, and lifecycle management for Wingmnn users.",
				tag: "SSO",
			},
			{
				name: "Azure AD",
				description:
					"Enterprise identity and access with conditional policies.",
				tag: "SSO",
			},
			{
				name: "OneLogin",
				description: "Centralized identity with fine-grained access controls.",
				tag: "SSO",
			},
			{
				name: "Drata",
				description:
					"Feed Wingmnn activity into your SOC 2/GDPR monitoring workflows.",
				tag: "Compliance",
			},
			{
				name: "Tugboat Logic",
				description: "Automate proof collection and security questionnaires.",
				tag: "Compliance",
			},
			{
				name: "Duo Security",
				description: "Feed MFA posture into approvals and access policies.",
				tag: "MFA",
			},
		],
	},
	{
		icon: Layers,
		title: "Finance & Ops",
		description:
			"Unify billing, payments, and approvals across finance operations.",
		color: "var(--module-finance)",
		integrations: [
			{
				name: "Stripe",
				description: "Sync invoices, payment status, and cashflow forecasting.",
				tag: "Payments",
			},
			{
				name: "QuickBooks",
				description: "Auto-categorize expenses and sync approvals.",
				tag: "Accounting",
			},
			{
				name: "Xero",
				description: "Two-way accounting sync with Wingmnn finance streams.",
				tag: "Accounting",
			},
			{
				name: "Bill.com",
				description: "Mirror approvals, payments, and audit trails.",
				tag: "AP",
			},
			{
				name: "Ramp",
				description: "Bring spend insights and card controls into Wingmnn.",
				tag: "Spend",
			},
			{
				name: "NetSuite",
				description:
					"Mirror ERP data, approvals, and finance reporting bi-directionally.",
				tag: "ERP",
			},
		],
	},
	{
		icon: Users,
		title: "HR & People Ops",
		description:
			"Support hiring, onboarding, payroll, and performance rituals.",
		color: "var(--module-wellness)",
		integrations: [
			{
				name: "Workday",
				description: "Sync org charts, approvals, and hiring workflows.",
				tag: "Enterprise",
			},
			{
				name: "BambooHR",
				description: "Bring PTO, reviews, and onboarding tasks into Wingmnn.",
				tag: "HRIS",
			},
			{
				name: "Gusto",
				description: "Surface payroll events and compliance reminders.",
				tag: "Payroll",
			},
			{
				name: "Deel",
				description: "Coordinate global hiring, contracts, and payments.",
				tag: "Global",
			},
			{
				name: "Rippling",
				description:
					"Automate onboarding checklists with device and app provisioning.",
				tag: "IT & HR",
			},
			{
				name: "Lattice",
				description: "Sync goals, feedback cycles, and performance updates.",
				tag: "Performance",
			},
		],
	},
	{
		icon: Headphones,
		title: "Customer Support & Success",
		description:
			"Keep ticket queues, success plans, and customer health in sync.",
		color: "var(--module-mail)",
		integrations: [
			{
				name: "Zendesk",
				description: "Bring ticket context into Wingmnn rituals and projects.",
				tag: "Support",
			},
			{
				name: "Intercom",
				description: "Sync conversations, SLAs, and customer health.",
				tag: "Support",
			},
			{
				name: "Front",
				description: "Route shared inbox messages into action items.",
				tag: "Inbox",
			},
			{
				name: "Help Scout",
				description:
					"Connect docs, workflows, and success playbooks to tickets.",
				tag: "Docs",
			},
			{
				name: "Freshdesk",
				description: "Mirror queues, statuses, and automations across teams.",
				tag: "Support",
			},
			{
				name: "Salesforce Service Cloud",
				description: "Keep accounts, escalations, and success plans aligned.",
				tag: "CRM",
			},
		],
	},
];

function IntegrationsPage() {
	const totalIntegrations = integrationCategories.reduce(
		(acc, category) => acc + category.integrations.length,
		0,
	);

	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
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

				<section className="space-y-6 text-center">
					<div className="space-y-4">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							<span className="text-primary">Connect Wingmnn</span> to
							everything.
						</h1>
						<p className="text-lg text-muted-foreground max-w-3xl mx-auto">
							Plug into the tools your team already loves. Sync data, automate
							routines, and keep every workflow in rhythm.
						</p>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-6">
						<div className="retro-border bg-card/80 backdrop-blur-sm px-6 py-4">
							<p className="font-mono uppercase text-xs text-muted-foreground">
								Native Integrations
							</p>
							<p className="text-3xl font-bold">{totalIntegrations}+</p>
						</div>
						<div className="retro-border bg-card/80 backdrop-blur-sm px-6 py-4">
							<p className="font-mono uppercase text-xs text-muted-foreground">
								Automation Reach
							</p>
							<p className="text-3xl font-bold">5,000+</p>
							<p className="text-xs text-muted-foreground mt-1">
								Via Zapier / Make / n8n
							</p>
						</div>
						<div className="retro-border bg-card/80 backdrop-blur-sm px-6 py-4">
							<p className="font-mono uppercase text-xs text-muted-foreground">
								Enterprise Ready
							</p>
							<p className="text-3xl font-bold">SOC 2 • GDPR • SSO</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-4 justify-center">
						<Button className="retro-button retro-button-primary px-8 py-3 text-base font-mono uppercase tracking-wider">
							<Link
								to="/contact"
								className="inline-flex items-center gap-2"
							>
								Request an integration
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button className="retro-button retro-button-outline px-8 py-3 text-base font-mono uppercase tracking-wider">
							<Link
								to="/security"
								className="inline-flex items-center gap-2"
							>
								View security & compliance
							</Link>
						</Button>
					</div>
				</section>

				<section className="space-y-12">
					{integrationCategories.map((category, idx) => {
						const Icon = category.icon;
						return (
							<div
								key={category.title}
								className="retro-border bg-card/80 backdrop-blur-sm p-8 md:p-10 rounded-none space-y-8 relative overflow-hidden"
							>
								<div
									className="absolute inset-0 opacity-5"
									style={{
										backgroundImage: `
											linear-gradient(var(--border) 1px, transparent 1px),
											linear-gradient(90deg, var(--border) 1px, transparent 1px)
										`,
										backgroundSize: "30px 30px",
									}}
								/>
								<div className="relative space-y-4">
									<div className="flex flex-wrap items-center gap-4">
										<div
											className="p-3 retro-border rounded-none"
											style={{ backgroundColor: category.color }}
										>
											<Icon className="h-6 w-6 text-foreground" />
										</div>
										<div>
											<p className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground">
												Category #{idx + 1}
											</p>
											<h2 className="text-3xl font-bold font-mono uppercase tracking-wider">
												{category.title}
											</h2>
										</div>
									</div>
									<p className="text-muted-foreground max-w-2xl">
										{category.description}
									</p>
								</div>
								<div className="relative grid gap-4 md:grid-cols-2">
									{category.integrations.map((integration) => (
										<div
											key={integration.name}
											className="retro-border bg-card/90 backdrop-blur-sm p-6 rounded-none"
										>
											<div className="flex items-center justify-between">
												<div>
													<h3 className="font-semibold text-lg">
														{integration.name}
													</h3>
													<p className="text-sm text-muted-foreground">
														{integration.description}
													</p>
												</div>
												<Badge
													variant="secondary"
													className="rounded-none"
												>
													{integration.tag}
												</Badge>
											</div>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</section>

				<section className="retro-border bg-card/80 backdrop-blur-sm p-10 rounded-none text-center space-y-4">
					<h2 className="text-3xl md:text-4xl font-bold">
						Need a specific integration?
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						We build enterprise integrations on request and support custom APIs,
						webhooks, and on-prem deployments.
					</p>
					<div className="flex flex-wrap gap-4 justify-center">
						<Button className="retro-button retro-button-primary px-8 py-3 text-base font-mono uppercase tracking-wider">
							<Link
								to="/contact"
								className="inline-flex items-center gap-2"
							>
								Chat with us
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button className="retro-button retro-button-outline px-8 py-3 text-base font-mono uppercase tracking-wider">
							<Link
								to="/help"
								className="inline-flex items-center gap-2"
							>
								Visit API docs
							</Link>
						</Button>
					</div>
				</section>
			</div>

			<FloatingFooter />
		</div>
	);
}
