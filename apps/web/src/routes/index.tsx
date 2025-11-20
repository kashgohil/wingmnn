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
} from "lucide-react";
import { useId } from "react";
import { FloatingHeader } from "../components/FloatingHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export const Route = createFileRoute("/")({ component: App });

const modules = [
	{
		name: "Mails",
		description: "Unified inbox, priority sorting, follow-up nudges.",
		colorVar: "--module-mail",
		icon: Inbox,
	},
	{
		name: "Notes",
		description: "Lightweight docs with AI summaries and backlinks.",
		colorVar: "--module-notes",
		icon: FileText,
	},
	{
		name: "Finance",
		description: "Cashflow, invoices, and approvals in one stream.",
		colorVar: "--module-finance",
		icon: DollarSign,
	},
	{
		name: "Feeds",
		description: "Digest company activity and curated industry intel.",
		colorVar: "--module-feeds",
		icon: Rss,
	},
	{
		name: "Messages",
		description: "Secure DMs plus async voice & video drops.",
		colorVar: "--module-messages",
		icon: MessageSquare,
	},
	{
		name: "Calendar",
		description:
			"Schedule meetings, track deadlines, and sync team availability.",
		colorVar: "--module-calendar",
		icon: Calendar,
	},
	{
		name: "Wellness",
		description: "Micro-check-ins, focus playlists, burnout alerts.",
		colorVar: "--module-wellness",
		icon: Heart,
	},
	{
		name: "Projects",
		description: "Roadmaps, tasks, and rituals tied to outcomes.",
		colorVar: "--module-projects",
		icon: FolderKanban,
	},
	{
		name: "Files",
		description: "Versioned handoffs with smart organization.",
		colorVar: "--module-files",
		icon: Folder,
	},
	{
		name: "Fun",
		description: "Team rituals, async games, surprise celebrations.",
		colorVar: "--module-fun",
		icon: PartyPopper,
	},
];

function App() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<FloatingHeader />
			<div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
				<Hero />
				<div className="grid gap-10 lg:grid-cols-2">
					<Modules />
					<AuthPanel />
				</div>
			</div>
		</div>
	);
}

function Hero() {
	return (
		<section className="flex flex-col gap-8 text-center md:text-left">
			<div className="inline-flex items-center gap-3 text-sm font-medium text-muted-foreground">
				<ShieldCheck className="h-4 w-4" />
				Human-centered ops stack
			</div>
			<div className="space-y-4">
				<h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl text-center">
					Wingmnn keeps every part of your team rhythm tidy, from mails to fun.
				</h1>
				<p className="text-lg mx-auto text-center text-muted-foreground md:max-w-3xl">
					Ship faster rituals with one login. Wingmnn blends comms, docs, money,
					wellness, and play so you gain clarity without juggling tabs or
					tooling fluff.
				</p>
			</div>
			<div className="flex flex-wrap items-center justify-center gap-4 ">
				<Button
					className="flex items-center gap-2 px-6 py-5 text-base"
					type="button"
				>
					Start with email
					<ArrowRight className="h-4 w-4" />
				</Button>
				<Button
					className="px-6 py-5 text-base"
					type="button"
					variant="outline"
				>
					See platform tour
				</Button>
			</div>
		</section>
	);
}

function Modules() {
	return (
		<section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10">
			<div className="mb-8 flex flex-col gap-2">
				<h2 className="text-2xl font-semibold text-foreground">
					Every workspace beat, ready for you.
				</h2>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				{modules.map((module) => {
					const Icon = module.icon;
					return (
						<div
							key={module.name}
							className="rounded-2xl border border-transparent p-5 transition hover:translate-y-0.5"
							style={{ backgroundColor: `var(${module.colorVar})` }}
						>
							<div className="mb-3 flex items-center gap-2">
								<Icon className="h-5 w-5 text-foreground" />
								<p className="text-sm font-semibold uppercase text-foreground">
									{module.name}
								</p>
							</div>
							<p className="text-sm text-foreground opacity-80">
								{module.description}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function AuthPanel() {
	return (
		<section className="flex flex-col gap-10 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10">
			<div className="space-y-4">
				<h3 className="text-2xl font-semibold text-foreground">Jump back in</h3>
				<LoginForm />
			</div>
			<div className="relative flex items-center gap-4">
				<div className="flex-1 border-t border-border" />
				<span className="text-sm font-medium text-muted-foreground">OR</span>
				<div className="flex-1 border-t border-border" />
			</div>
			<div className="space-y-4">
				<h3 className="text-2xl font-semibold text-foreground">
					Create your Wingmnn
				</h3>
				<SignupForm />
				<p className="text-xs text-muted-foreground">
					By continuing you agree to our Terms and confirm you're ready for tidy
					ops.
				</p>
			</div>
		</section>
	);
}

function LoginForm() {
	const emailId = useId();
	const passwordId = useId();

	return (
		<form className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor={emailId}>Work email</Label>
				<Input
					id={emailId}
					placeholder="you@wingmnn.com"
					type="email"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={passwordId}>Password</Label>
				<Input
					id={passwordId}
					placeholder="••••••••"
					type="password"
				/>
			</div>
			<Button
				className="w-full py-5 text-base"
				type="submit"
			>
				Log in
			</Button>
		</form>
	);
}

function SignupForm() {
	const nameId = useId();
	const emailId = useId();
	const teamId = useId();

	return (
		<form className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor={nameId}>Full name</Label>
				<Input
					id={nameId}
					placeholder="Alex Wingman"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={emailId}>Company email</Label>
				<Input
					id={emailId}
					placeholder="ops@studio.com"
					type="email"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={teamId}>Team size</Label>
				<Input
					id={teamId}
					placeholder="25"
					type="number"
					min="1"
				/>
			</div>
			<Button
				className="w-full py-5 text-base"
				type="submit"
				variant="outline"
			>
				Secure my invite
			</Button>
		</form>
	);
}
