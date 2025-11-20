import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { useId } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export const Route = createFileRoute("/")({ component: App });

const modules = [
  {
    name: "Mails",
    description: "Unified inbox, priority sorting, follow-up nudges.",
    colorVar: "--module-mail",
  },
  {
    name: "Notes",
    description: "Lightweight docs with AI summaries and backlinks.",
    colorVar: "--module-notes",
  },
  {
    name: "Finance",
    description: "Cashflow, invoices, and approvals in one stream.",
    colorVar: "--module-finance",
  },
  {
    name: "Feeds",
    description: "Digest company activity and curated industry intel.",
    colorVar: "--module-feeds",
  },
  {
    name: "Messages",
    description: "Secure DMs plus async voice & video drops.",
    colorVar: "--module-messages",
  },
  {
    name: "Wellness",
    description: "Micro-check-ins, focus playlists, burnout alerts.",
    colorVar: "--module-wellness",
  },
  {
    name: "Projects",
    description: "Roadmaps, tasks, and rituals tied to outcomes.",
    colorVar: "--module-projects",
  },
  {
    name: "Files",
    description: "Versioned handoffs with smart organization.",
    colorVar: "--module-files",
  },
  {
    name: "Fun",
    description: "Team rituals, async games, surprise celebrations.",
    colorVar: "--module-fun",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
        <Hero />
        <Modules />
        <AuthPanel />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="flex flex-col gap-8 text-center md:text-left">
      <div className="inline-flex items-center gap-3 text-sm font-medium text-[var(--muted-foreground)]">
        <ShieldCheck className="h-4 w-4" />
        Human-centered ops stack
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
          Wingmnn keeps every part of your team rhythm tidy, from mails to fun.
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] md:max-w-3xl">
          Ship faster rituals with one login. Wingmnn blends comms, docs, money,
          wellness, and play so you gain clarity without juggling tabs or
          tooling fluff.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
        <Button
          className="flex items-center gap-2 px-6 py-5 text-base"
          type="button"
        >
          Start with email
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button className="px-6 py-5 text-base" type="button" variant="outline">
          See platform tour
        </Button>
      </div>
    </section>
  );
}

function Modules() {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm md:p-10">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          modules
        </p>
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Every workspace beat, ready in pastel focus.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <div
            key={module.name}
            className="rounded-2xl border border-transparent p-5 transition hover:translate-y-0.5"
            style={{ backgroundColor: `var(${module.colorVar})` }}
          >
            <p className="text-sm font-semibold uppercase text-[var(--foreground)]">
              {module.name}
            </p>
            <p className="mt-2 text-sm text-[var(--foreground)] opacity-80">
              {module.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AuthPanel() {
  return (
    <section className="grid gap-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm md:grid-cols-2 md:p-10">
      <div className="space-y-4">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
          <Mail className="h-4 w-4" />
          login
        </p>
        <h3 className="text-2xl font-semibold text-[var(--foreground)]">
          Jump back in
        </h3>
        <LoginForm />
      </div>
      <div className="space-y-4">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          new here?
        </p>
        <h3 className="text-2xl font-semibold text-[var(--foreground)]">
          Create your Wingmnn
        </h3>
        <SignupForm />
        <p className="text-xs text-[var(--muted-foreground)]">
          By continuing you agree to our Terms and confirm you’re ready for tidy
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
        <Input id={emailId} placeholder="you@wingmnn.com" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={passwordId}>Password</Label>
        <Input id={passwordId} placeholder="••••••••" type="password" />
      </div>
      <Button className="w-full py-5 text-base" type="submit">
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
        <Input id={nameId} placeholder="Alex Wingman" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={emailId}>Company email</Label>
        <Input id={emailId} placeholder="ops@studio.com" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={teamId}>Team size</Label>
        <Input id={teamId} placeholder="25" type="number" min="1" />
      </div>
      <Button className="w-full py-5 text-base" type="submit" variant="outline">
        Secure my invite
      </Button>
    </form>
  );
}
