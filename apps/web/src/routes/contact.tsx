import { createFileRoute } from "@tanstack/react-router";
import { FloatingFooter } from "../components/FloatingFooter";
import { FloatingHeader } from "../components/FloatingHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Mail, MessageSquare, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
	component: ContactPage,
});

function ContactPage() {
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

			<div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 pt-6 pb-24">
				<FloatingHeader />
				
				<div className="space-y-12">
					<div className="text-center space-y-4">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							<span className="text-primary">Contact</span> Us
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Have a question? We'd love to hear from you. Send us a message and we'll respond as
							soon as possible.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8">
						<div className="space-y-6">
							<div className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none">
								<div className="flex items-center gap-4 mb-4">
									<div
										className="w-12 h-12 rounded-none retro-border flex items-center justify-center"
										style={{ backgroundColor: "var(--module-mail)" }}
									>
										<Mail className="h-6 w-6 text-foreground" />
									</div>
									<div>
										<h3 className="text-lg font-bold font-mono uppercase">Email</h3>
										<p className="text-sm text-muted-foreground">General inquiries</p>
									</div>
								</div>
								<a
									href="mailto:hello@wingmnn.com"
									className="text-primary hover:underline"
								>
									hello@wingmnn.com
								</a>
							</div>

							<div className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none">
								<div className="flex items-center gap-4 mb-4">
									<div
										className="w-12 h-12 rounded-none retro-border flex items-center justify-center"
										style={{ backgroundColor: "var(--module-messages)" }}
									>
										<MessageSquare className="h-6 w-6 text-foreground" />
									</div>
									<div>
										<h3 className="text-lg font-bold font-mono uppercase">Support</h3>
										<p className="text-sm text-muted-foreground">Technical support</p>
									</div>
								</div>
								<a
									href="mailto:support@wingmnn.com"
									className="text-primary hover:underline"
								>
									support@wingmnn.com
								</a>
							</div>
						</div>

						<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
							<h2 className="text-2xl font-bold font-mono uppercase mb-6">
								Send a Message
							</h2>
							<form className="space-y-6">
								<div>
									<Label htmlFor="name">Name</Label>
									<Input id="name" type="text" placeholder="Your name" />
								</div>
								<div>
									<Label htmlFor="email">Email</Label>
									<Input id="email" type="email" placeholder="your@email.com" />
								</div>
								<div>
									<Label htmlFor="subject">Subject</Label>
									<Input id="subject" type="text" placeholder="What's this about?" />
								</div>
								<div>
									<Label htmlFor="message">Message</Label>
									<Textarea
										id="message"
										placeholder="Tell us what's on your mind..."
										rows={6}
									/>
								</div>
								<Button type="submit" className="w-full gap-2">
									<Send className="h-4 w-4" />
									Send Message
								</Button>
							</form>
						</div>
					</div>
				</div>
			</div>
			<FloatingFooter />
		</div>
	);
}

