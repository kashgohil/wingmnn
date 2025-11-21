import { useState } from "react";
import * as React from "react";
import { useId } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { GoogleIcon } from "./icons/GoogleIcon";

interface AuthDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialMode?: "login" | "signup";
}

export function AuthDialog({ open, onOpenChange, initialMode = "login" }: AuthDialogProps) {
	const [mode, setMode] = useState<"login" | "signup">(initialMode);

	// Reset mode when dialog opens with a new initialMode
	React.useEffect(() => {
		if (open) {
			setMode(initialMode);
		}
	}, [open, initialMode]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "login" ? "Jump back in" : "Create your Wingmnn"}
					</DialogTitle>
					<DialogDescription>
						{mode === "login"
							? "Welcome back! Sign in to continue."
							: "Get started with your team workspace."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{mode === "login" ? <LoginForm /> : <SignupForm />}

					<div className="relative flex items-center gap-4">
						<div className="flex-1 border-t border-border" />
						<span className="text-sm font-semibold text-foreground/80">OR</span>
						<div className="flex-1 border-t border-border" />
					</div>

					<div className="text-center">
						<button
							type="button"
							onClick={() => setMode(mode === "login" ? "signup" : "login")}
							className="text-sm font-semibold text-primary hover:underline"
						>
							{mode === "login"
								? "Don't have an account? Sign up"
								: "Already have an account? Sign in"}
						</button>
					</div>

					{mode === "signup" && (
						<p className="text-xs text-center font-medium text-foreground/70">
							By continuing you agree to our Terms and confirm you're ready for
							tidy ops.
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function LoginForm() {
	const emailId = useId();
	const passwordId = useId();

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
			}}
		>
			<div className="space-y-2">
				<Label htmlFor={emailId}>Work email</Label>
				<Input
					id={emailId}
					placeholder="you@wingmnn.com"
					type="email"
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={passwordId}>Password</Label>
				<Input
					id={passwordId}
					placeholder="••••••••"
					type="password"
					required
				/>
			</div>
			<div className="space-y-3">
				<Button className="w-full py-5 text-base" type="submit">
					Log in
				</Button>
				<Button
					variant="outline"
					className="w-full py-5 text-base"
					type="button"
					asChild
				>
					<a
						href="/auth/google"
						className="flex items-center justify-center gap-3"
						aria-label="Continue with Google"
					>
						<GoogleIcon className="h-5 w-5" />
						<span>Continue with Google</span>
					</a>
				</Button>
			</div>
		</form>
	);
}

function SignupForm() {
	const nameId = useId();
	const emailId = useId();
	const teamId = useId();

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
			}}
		>
			<div className="space-y-2">
				<Label htmlFor={nameId}>Full name</Label>
				<Input id={nameId} placeholder="Alex Wingman" required />
			</div>
			<div className="space-y-2">
				<Label htmlFor={emailId}>Company email</Label>
				<Input
					id={emailId}
					placeholder="ops@studio.com"
					type="email"
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={teamId}>Team size</Label>
				<Input
					id={teamId}
					placeholder="25"
					type="number"
					min="1"
					required
				/>
			</div>
			<Button className="w-full py-5 text-base" type="submit" variant="outline">
				Secure my invite
			</Button>
		</form>
	);
}

