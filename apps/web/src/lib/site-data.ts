import type { LucideIcon } from "lucide-react";
import {
  Database,
  DollarSign,
  FileText,
  FolderKanban,
  GitBranch,
  GitMerge,
  Headphones,
  Layers,
  MessageSquare,
  PlayCircle,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  color: string;
  highlight?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Launch",
    price: "$29",
    period: "per user/month",
    description: "All the essentials to unify work across a lean team.",
    features: [
      "Up to 25 teammates",
      "Pick 4 core modules",
      "AI summaries & follow-ups",
      "Shared automations",
      "Email + chat support",
    ],
    color: "var(--module-mail)",
  },
  {
    name: "Scale",
    price: "$59",
    period: "per user/month",
    description: "Growing teams that need deeper visibility and rituals.",
    features: [
      "Unlimited teammates",
      "All core modules included",
      "Advanced automations & playbooks",
      "Rollup analytics dashboards",
      "Priority support",
    ],
    color: "var(--module-projects)",
    highlight: true,
  },
  {
    name: "Operations+",
    price: "$89",
    period: "per user/month",
    description: "Scaled orgs with layered approvals and governance.",
    features: [
      "Everything in Scale",
      "Granular permissions & audit logs",
      "Forecasting + scenario planning",
      "Advanced compliance controls",
      "Quarterly success reviews",
    ],
    color: "var(--module-finance)",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "Ops, security, and procurement tailored to your stack.",
    features: [
      "Dedicated solution architect",
      "Private cloud or on-prem",
      "Custom integrations & SLAs",
      "Security reviews + compliance help",
      "24/7 global support",
    ],
    color: "var(--module-notes)",
  },
];

export interface ModulePrice {
  slug: string;
  monthly: number;
  summary: string;
}

export const modulePricing: ModulePrice[] = [
  {
    slug: "mails",
    monthly: 10,
    summary: "Priority inbox, follow-ups, and AI triage.",
  },
  {
    slug: "notes",
    monthly: 6,
    summary: "Docs, decision trails, and AI summaries.",
  },
  {
    slug: "finance",
    monthly: 15,
    summary: "Cash, invoicing, and forecasting in one view.",
  },
  {
    slug: "feeds",
    monthly: 9,
    summary: "Intelligence streams and exec-ready briefs.",
  },
  {
    slug: "messages",
    monthly: 15,
    summary: "Secure async chat with shared rituals.",
  },
  {
    slug: "calendar",
    monthly: 10,
    summary: "Smart scheduling, deadlines, and focus slots.",
  },
  {
    slug: "wellness",
    monthly: 8,
    summary: "Team pulse, nudges, and burnout alerts.",
  },
  {
    slug: "projects",
    monthly: 20,
    summary: "Outcome-driven roadmaps and rituals.",
  },
  {
    slug: "files",
    monthly: 15,
    summary: "Versioned files, search, and governance.",
  },
  {
    slug: "fun",
    monthly: 5,
    summary: "Culture rituals, celebrations, and prompts.",
  },
];

export const modulePriceMap = modulePricing.reduce((acc, module) => {
  acc[module.slug] = module.monthly;
  return acc;
}, {} as Record<string, number>);

export interface IntegrationItem {
  name: string;
  description: string;
  tag: string;
  icon?: LucideIcon;
  color?: string;
}

export interface IntegrationCategory {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  integrations: IntegrationItem[];
}

export const integrationCategories: IntegrationCategory[] = [
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
        icon: MessageSquare,
        color: "var(--module-messages)",
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
        icon: FileText,
        color: "var(--module-files)",
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
        icon: FileText,
        color: "var(--module-notes)",
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
        icon: Zap,
        color: "var(--module-projects)",
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
        icon: GitBranch,
        color: "var(--module-files)",
      },
      {
        name: "GitLab",
        description: "Two-way sync for merge requests and Wingmnn tasks.",
        tag: "Code",
        icon: GitMerge,
        color: "var(--module-projects)",
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
        icon: FolderKanban,
        color: "var(--module-projects)",
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
        icon: Sparkles,
        color: "var(--module-feeds)",
      },
      {
        name: "Adobe CC",
        description:
          "Keep creative assets versioned and linked to deliverables.",
        tag: "Design",
      },
      {
        name: "Marketo",
        description: "Sync campaign performance, MQLs, and nurture workflows.",
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
        icon: DollarSign,
        color: "var(--module-finance)",
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

export const spotlightIntegrations = integrationCategories
  .flatMap((category) =>
    category.integrations.map((integration) => ({
      name: integration.name,
      icon: integration.icon,
      color: integration.color ?? category.color,
    }))
  )
  .filter((integration) => integration.icon)
  .slice(0, 8) as {
  name: string;
  icon: LucideIcon;
  color: string;
}[];
