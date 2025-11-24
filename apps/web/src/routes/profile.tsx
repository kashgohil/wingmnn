import { SoftRetroGridBackground } from "@/components/backgrounds/RetroGridPatterns";
import { generateMetadata } from "@/lib/metadata";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { catchError } from "@wingmnn/utils/catch-error";
import {
	Calendar,
	CheckCircle2,
	Clock,
	Edit2,
	FileText,
	Mail,
	Moon,
	MoonStar,
	Sun,
	Sunrise,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../components/ui/tooltip";
import { useAuth } from "../lib/auth/auth-context";
import { api } from "../lib/eden-client";

export const Route = createFileRoute("/profile")({
	component: Profile,
	head: () =>
		generateMetadata({
			title: "Profile",
			description: "Your Wingmnn user profile",
			noindex: true,
		}),
});

function Profile() {
	const { user } = useAuth();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [timeOfDayIcon, setTimeOfDayIcon] = useState<{
		icon: typeof Sun;
		label: string;
		greeting: string;
	}>({ icon: Sun, label: "Day", greeting: "Hello" });

	// Update greeting based on time of day
	useEffect(() => {
		const updateTimeOfDay = () => {
			const now = new Date();
			const hour = now.getHours();

			if (hour >= 5 && hour < 8) {
				setTimeOfDayIcon({
					icon: Sunrise,
					label: "Early Morning",
					greeting: "Good morning",
				});
			} else if (hour >= 8 && hour < 12) {
				setTimeOfDayIcon({
					icon: Sun,
					label: "Morning",
					greeting: "Good morning",
				});
			} else if (hour >= 12 && hour < 17) {
				setTimeOfDayIcon({
					icon: Sun,
					label: "Afternoon",
					greeting: "Good afternoon",
				});
			} else if (hour >= 17 && hour < 21) {
				setTimeOfDayIcon({
					icon: Moon,
					label: "Evening",
					greeting: "Good evening",
				});
			} else {
				setTimeOfDayIcon({
					icon: MoonStar,
					label: "Night",
					greeting: "Good night",
				});
			}
		};

		updateTimeOfDay();
		const interval = setInterval(updateTimeOfDay, 60000);
		return () => clearInterval(interval);
	}, []);

	const TimeIcon = timeOfDayIcon.icon;

	// Format date helper
	const formatDate = (date: Date | string | undefined) => {
		if (!date) return "N/A";
		const d = typeof date === "string" ? new Date(date) : date;
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(d);
	};

	// Format relative time helper
	const formatRelativeTime = (date: Date | string | undefined) => {
		if (!date) return "N/A";
		const d = typeof date === "string" ? new Date(date) : date;
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return `${Math.floor(diffDays / 365)} years ago`;
	};

	return (
		<ProtectedRoute>
			<TooltipProvider>
				<div className="h-screen bg-background text-foreground overflow-y-auto">
					<SoftRetroGridBackground className="absolute h-full overflow-hidden opacity-40" />
					<div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 pt-36 sm:pt-8 pb-24">
						<div className="space-y-8">
							{/* Greeting Card - Similar to Module Heading */}
							<div className="flex items-center gap-4">
								<div
									className="p-6 retro-border rounded-none"
									style={{
										backgroundColor: "var(--primary)",
									}}
								>
									<TimeIcon className="h-12 w-12 text-primary-foreground" />
								</div>
								<div className="flex-1">
									<h1 className="text-4xl font-bold font-mono uppercase tracking-wider">
										{timeOfDayIcon.greeting},{" "}
										{user?.name?.split(" ")[0] || "there"}!
									</h1>
									<p className="text-muted-foreground mt-2">
										Here's your profile overview and account details
									</p>
								</div>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											onClick={() => setEditDialogOpen(true)}
										>
											<Edit2 className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Edit Profile</p>
									</TooltipContent>
								</Tooltip>
							</div>

							{/* Profile Information */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-4 p-0">
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Profile Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{/* Name */}
										<Card
											padding="md"
											className="bg-card/50 flex items-start gap-4"
										>
											<div className="p-2 retro-border rounded-none bg-primary/10">
												<User className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1">
												<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
													Full Name
												</p>
												<p className="font-medium text-lg">
													{user?.name || "N/A"}
												</p>
											</div>
										</Card>

										{/* Email */}
										<Card
											padding="md"
											className="bg-card/50 flex items-start gap-4"
										>
											<div className="p-2 retro-border rounded-none bg-primary/10">
												<Mail className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1">
												<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
													Email Address
												</p>
												<p className="font-medium text-lg">
													{user?.email || "N/A"}
												</p>
											</div>
										</Card>

										{/* Bio */}
										<Card
											padding="md"
											className="bg-card/50 flex items-start gap-4"
										>
											<div className="p-2 retro-border rounded-none bg-primary/10">
												<FileText className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1">
												<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
													Bio
												</p>
												<p className="font-medium text-lg">
													{user?.bio || "No bio added yet"}
												</p>
											</div>
										</Card>
									</div>
								</CardContent>
							</Card>

							{/* Account Details */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-4 p-0">
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Account Details
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Account Status */}
										<Card
											padding="md"
											className="bg-card/50"
										>
											<div className="flex items-start gap-4">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<CheckCircle2 className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Account Status
													</p>
													<p className="font-medium text-lg">Active</p>
												</div>
											</div>
										</Card>

										{/* Account Type */}
										<Card
											padding="md"
											className="bg-card/50"
										>
											<div className="flex items-start gap-4">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<User className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Account Type
													</p>
													<p className="font-medium text-lg">Standard</p>
												</div>
											</div>
										</Card>

										{/* Member Since */}
										<Card
											padding="md"
											className="bg-card/50"
										>
											<div className="flex items-start gap-4">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Calendar className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Member Since
													</p>
													<p className="font-medium text-lg">
														{formatDate(user?.createdAt)}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														{formatRelativeTime(user?.createdAt)}
													</p>
												</div>
											</div>
										</Card>

										{/* Last Updated */}
										<Card
											padding="md"
											className="bg-card/50"
										>
											<div className="flex items-start gap-4">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Clock className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Last Updated
													</p>
													<p className="font-medium text-lg">
														{formatDate(user?.updatedAt)}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														{formatRelativeTime(user?.updatedAt)}
													</p>
												</div>
											</div>
										</Card>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>

				{/* Edit Profile Dialog */}
				<EditProfileDialog
					open={editDialogOpen}
					onOpenChange={setEditDialogOpen}
				/>
			</TooltipProvider>
		</ProtectedRoute>
	);
}

interface EditProfileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [name, setName] = useState(user?.name || "");
	const [bio, setBio] = useState(user?.bio || "");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Update form when user changes
	useEffect(() => {
		if (user) {
			setName(user.name || "");
			setBio(user.bio || "");
		}
	}, [user]);

	const updateProfileMutation = useMutation({
		mutationFn: async (data: { name: string; bio: string }) => {
			const [response, err] = await catchError(
				(api.auth.me as any).put({
					name: data.name,
					bio: data.bio,
				}),
			);

			if (err) {
				throw new Error(
					err instanceof Error ? err.message : "Failed to update profile",
				);
			}

			const responseData = response as any;
			if (responseData?.error) {
				const errorMessage =
					typeof responseData.error === "object" &&
					"message" in responseData.error
						? String(responseData.error.message)
						: "Failed to update profile";
				throw new Error(errorMessage);
			}

			return responseData?.data;
		},
		onSuccess: (data) => {
			// Update the user in the query cache
			queryClient.setQueryData(["auth", "user"], data);
			onOpenChange(false);
			setError(null);
		},
		onError: (error: Error) => {
			setError(error.message || "Failed to update profile");
		},
	});

	const handleSave = async () => {
		if (!name.trim()) {
			setError("Name is required");
			return;
		}

		setError(null);
		setIsSaving(true);
		try {
			await updateProfileMutation.mutateAsync({
				name: name.trim(),
				bio: bio.trim(),
			});
		} catch (err) {
			// Error is handled by mutation
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="font-mono uppercase tracking-wider">
						Edit Profile
					</DialogTitle>
					<DialogDescription>Update your profile information</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
						{error}
					</div>
				)}

				<div className="space-y-4">
					<div>
						<Label htmlFor="name">Full Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor="bio">Bio</Label>
						<Textarea
							id="bio"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							placeholder="Tell us about yourself"
							className="mt-1"
							rows={4}
						/>
					</div>

					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							value={user?.email || ""}
							disabled
							className="mt-1 opacity-50 cursor-not-allowed"
						/>
						<p className="text-xs text-muted-foreground mt-1">
							Email cannot be changed
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={isSaving || !name.trim()}
					>
						{isSaving ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
