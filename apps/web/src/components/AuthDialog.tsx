import { catchError } from "@wingmnn/utils/catch-error";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "../lib/api/base-url";
import { useAuth } from "../lib/auth/auth-context";
import { GoogleIcon } from "./icons/GoogleIcon";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AuthDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialMode?: "login" | "signup";
}

export function AuthDialog({
	open,
	onOpenChange,
	initialMode = "login",
}: AuthDialogProps) {
	const [mode, setMode] = useState<"login" | "signup">(initialMode);
	const { error, clearError } = useAuth();

	// Reset mode and clear errors when dialog opens
	useEffect(() => {
		if (open) {
			setMode(initialMode);
			clearError();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, initialMode]);

	// Handle mode switching with error clearing
	const handleModeSwitch = () => {
		setMode(mode === "login" ? "signup" : "login");
		clearError();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "login" ? "Jump back in" : "Create your account"}
					</DialogTitle>
					<DialogDescription>
						{mode === "login"
							? "Welcome back! Sign in to continue."
							: "Get started with your workspace."}
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
						{error}
					</div>
				)}

				<div className="space-y-6">
					{mode === "login" ? (
						<LoginForm onSuccess={() => onOpenChange(false)} />
					) : (
						<SignupForm onSuccess={() => onOpenChange(false)} />
					)}

					<div className="relative flex items-center gap-4">
						<div className="flex-1 border-t border-border" />
						<span className="text-sm font-semibold text-foreground/80">OR</span>
						<div className="flex-1 border-t border-border" />
					</div>

					<div className="text-center">
						<button
							type="button"
							onClick={handleModeSwitch}
							className="text-sm font-semibold text-primary hover:underline"
						>
							{mode === "login"
								? "Don't have an account? Sign up"
								: "Already have an account? Sign in"}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
	const { login, isLoading, clearError } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		const redirectParam = new URLSearchParams(window.location.search).get(
			"redirect",
		);

		const shouldCloseDialog = !redirectParam;

		const [, error] = await catchError(login(email, password));

		if (error) {
			// Error is handled by auth context
			return;
		}

		// Redirect is now handled by AuthProvider
		if (shouldCloseDialog) {
			onSuccess();
		}
	}

	// Clear errors when user types
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		clearError();
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
		clearError();
	};

	return (
		<form
			className="space-y-4"
			onSubmit={handleSubmit}
		>
			<div className="space-y-2">
				<Label htmlFor="login-email">Work email</Label>
				<Input
					id="login-email"
					type="email"
					value={email}
					onChange={handleEmailChange}
					placeholder="you@company.com"
					required
					disabled={isLoading}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="login-password">Password</Label>
				<Input
					id="login-password"
					type="password"
					value={password}
					onChange={handlePasswordChange}
					placeholder="••••••••"
					required
					disabled={isLoading}
				/>
			</div>
			<div className="space-y-3">
				<Button
					className="w-full py-5 text-base"
					type="submit"
					disabled={isLoading}
				>
					{isLoading ? "Logging in..." : "Log in"}
				</Button>
				<Button
					variant="outline"
					className="w-full py-5 text-base"
					type="button"
					asChild
				>
					<a
						href={(() => {
							const baseUrl = getApiBaseUrl();
							const params = new URLSearchParams(window.location.search);
							const redirectTo = params.get("redirect");
							return redirectTo
								? `${baseUrl}/auth/google?redirect=${encodeURIComponent(
										redirectTo,
								  )}`
								: `${baseUrl}/auth/google`;
						})()}
						className="flex items-center justify-center gap-3"
					>
						<GoogleIcon className="h-5 w-5" />
						<span>Continue with Google</span>
					</a>
				</Button>
			</div>
		</form>
	);
}

function SignupForm({ onSuccess }: { onSuccess: () => void }) {
	const { register, isLoading, clearError } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// Client-side validation
		if (password.length < 8) {
			// This will be handled by auth context error
			return;
		}

		const redirectParam = new URLSearchParams(window.location.search).get(
			"redirect",
		);

		const shouldCloseDialog = !redirectParam;

		const [, error] = await catchError(register(email, password, name));

		if (error) {
			// Error is handled by auth context
			return;
		}

		// Redirect is now handled by AuthProvider
		if (shouldCloseDialog) {
			onSuccess();
		}
	}

	// Clear errors when user types
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
		clearError();
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		clearError();
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
		clearError();
	};

	return (
		<form
			className="space-y-4"
			onSubmit={handleSubmit}
		>
			<div className="space-y-2">
				<Label htmlFor="signup-name">Full name</Label>
				<Input
					id="signup-name"
					value={name}
					onChange={handleNameChange}
					placeholder="Alex Wingman"
					required
					disabled={isLoading}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="signup-email">Company email</Label>
				<Input
					id="signup-email"
					type="email"
					value={email}
					onChange={handleEmailChange}
					placeholder="ops@studio.com"
					required
					disabled={isLoading}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="signup-password">Password</Label>
				<Input
					id="signup-password"
					type="password"
					value={password}
					onChange={handlePasswordChange}
					placeholder="••••••••"
					required
					minLength={8}
					disabled={isLoading}
				/>
				<p className="text-xs text-muted-foreground">
					Must be at least 8 characters
				</p>
			</div>
			<Button
				className="w-full py-5 text-base"
				type="submit"
				disabled={isLoading}
			>
				{isLoading ? "Creating account..." : "Create account"}
			</Button>
		</form>
	);
}
