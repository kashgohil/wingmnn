import { Link } from "@tanstack/react-router";

import { SoftRetroGridBackground } from "@/components/backgrounds/RetroGridPatterns";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-foreground">
			<SoftRetroGridBackground className="opacity-40" />
			<div className="relative flex max-w-2xl flex-col items-center gap-6 rounded-none border-2 border-border bg-card/90 p-10 text-center shadow-[8px_8px_0_0_var(--border)]">
				<div className="space-y-2">
					<p className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground">
						Error 404
					</p>
					<h1 className="text-4xl font-bold tracking-tight md:text-5xl">
						This page took a wrong turn
					</h1>
					<p className="text-base text-muted-foreground md:text-lg">
						The link you followed doesn&apos;t exist anymore. Let&apos;s get you
						back to familiar territory.
					</p>
				</div>

				<div className="grid w-full gap-3 text-left text-sm text-muted-foreground md:grid-cols-3">
					<div className="rounded-none border border-dashed border-border/60 p-4">
						<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
							01
						</p>
						<p className="font-semibold text-foreground">Check the URL</p>
						<p>Typos happen—make sure the address looks right.</p>
					</div>
					<div className="rounded-none border border-dashed border-border/60 p-4">
						<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
							02
						</p>
						<p className="font-semibold text-foreground">Jump to home</p>
						<p>Head back to the dashboard to continue exploring.</p>
					</div>
					<div className="rounded-none border border-dashed border-border/60 p-4">
						<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
							03
						</p>
						<p className="font-semibold text-foreground">Reach out</p>
						<p>Need help? Our team is just a message away.</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-4">
					<Button size="lg" asChild>
						<Link to="/">Back to home</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link to="/projects">Open projects</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

