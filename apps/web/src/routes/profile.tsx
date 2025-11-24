import { SoftRetroGridBackground } from "@/components/backgrounds/RetroGridPatterns";
import { generateMetadata } from "@/lib/metadata";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { catchError } from "@wingmnn/utils/catch-error";
import {
	Bell,
	Calendar,
	CheckCircle2,
	Clock,
	Edit2,
	FileText,
	Globe,
	Key,
	Lock,
	Mail,
	Moon,
	MoonStar,
	Settings,
	Shield,
	Sun,
	Sunrise,
	Trash2,
	User,
	Users,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Badge } from "../components/ui/badge";
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
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../components/ui/tooltip";
import { useTheme } from "../hooks/use-theme";
import { useAuth } from "../lib/auth/auth-context";
import { api } from "../lib/eden-client";
import { useProjects } from "../lib/hooks/use-projects";
import { useMyTasks } from "../lib/hooks/use-tasks";

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
	const { theme, setTheme } = useTheme();
	const { data: projects = [] } = useProjects();
	const { data: tasks = [] } = useMyTasks();
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	// Fetch active sessions
	const { data: sessionsData } = useQuery({
		queryKey: ["auth", "sessions"],
		queryFn: async () => {
			const [response, err] = await catchError(
				(api.auth.sessions as any).get(),
			);
			if (err) return { sessions: [] };
			const responseData = response as any;
			if (responseData?.error) return { sessions: [] };
			return responseData?.data || { sessions: [] };
		},
		staleTime: 30 * 1000,
	});

	const sessions = sessionsData?.sessions || [];
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

							{/* Preferences & Settings */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-4 p-0">
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Preferences & Settings
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{/* Theme Preference */}
										<Card
											padding="md"
											className="bg-card/50 flex items-center justify-between gap-4"
										>
											<div className="flex items-start gap-4 flex-1">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													{theme === "light" ? (
														<Sun className="h-5 w-5 text-primary" />
													) : (
														<Moon className="h-5 w-5 text-primary" />
													)}
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Theme
													</p>
													<p className="font-medium text-lg">
														{theme === "light" ? "Light Mode" : "Dark Mode"}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														Switch between light and dark themes
													</p>
												</div>
											</div>
											<Switch
												checked={theme === "dark"}
												onCheckedChange={(checked) =>
													setTheme(checked ? "dark" : "light")
												}
											/>
										</Card>

										{/* Notification Preferences */}
										<Card
											padding="md"
											className="bg-card/50 flex items-center justify-between gap-4"
										>
											<div className="flex items-start gap-4 flex-1">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Bell className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Email Notifications
													</p>
													<p className="font-medium text-lg">Enabled</p>
													<p className="text-xs text-muted-foreground mt-1">
														Receive email updates for important events
													</p>
												</div>
											</div>
											<Switch defaultChecked />
										</Card>

										{/* Language & Region */}
										<Card
											padding="md"
											className="bg-card/50 flex items-start gap-4"
										>
											<div className="p-2 retro-border rounded-none bg-primary/10">
												<Globe className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1">
												<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
													Language & Region
												</p>
												<p className="font-medium text-lg">English (US)</p>
												<p className="text-xs text-muted-foreground mt-1">
													Timezone:{" "}
													{Intl.DateTimeFormat().resolvedOptions().timeZone}
												</p>
											</div>
										</Card>
									</div>
								</CardContent>
							</Card>

							{/* Security */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-4 p-0">
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Security
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{/* Active Sessions */}
										<Card
											padding="md"
											className="bg-card/50"
										>
											<div className="flex items-start gap-4">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Shield className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Active Sessions
													</p>
													<p className="font-medium text-lg">
														{sessions.length} active session
														{sessions.length !== 1 ? "s" : ""}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														Manage devices where you're logged in
													</p>
													{sessions.length > 0 && (
														<div className="mt-3 space-y-2">
															{sessions.slice(0, 3).map((session: any) => (
																<div
																	key={session.id}
																	className="text-xs text-muted-foreground flex items-center gap-2"
																>
																	<Clock className="h-3 w-3" />
																	<span>
																		{session.userAgent?.substring(0, 50) ||
																			"Unknown device"}{" "}
																		•{" "}
																		{formatRelativeTime(session.lastActivityAt)}
																	</span>
																</div>
															))}
															{sessions.length > 3 && (
																<p className="text-xs text-muted-foreground">
																	+{sessions.length - 3} more session
																	{sessions.length - 3 !== 1 ? "s" : ""}
																</p>
															)}
														</div>
													)}
												</div>
											</div>
										</Card>

										{/* Password */}
										<Card
											padding="md"
											className="bg-card/50 flex items-center justify-between gap-4"
										>
											<div className="flex items-start gap-4 flex-1">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Key className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Password
													</p>
													<p className="font-medium text-lg">••••••••</p>
													<p className="text-xs text-muted-foreground mt-1">
														Last changed {formatRelativeTime(user?.updatedAt)}
													</p>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
											>
												Change
											</Button>
										</Card>

										{/* Two-Factor Authentication */}
										<Card
											padding="md"
											className="bg-card/50 flex items-center justify-between gap-4"
										>
											<div className="flex items-start gap-4 flex-1">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Lock className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Two-Factor Authentication
													</p>
													<p className="font-medium text-lg">Not enabled</p>
													<p className="text-xs text-muted-foreground mt-1">
														Add an extra layer of security to your account
													</p>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
											>
												Enable
											</Button>
										</Card>
									</div>
								</CardContent>
							</Card>

							{/* Activity & Statistics */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-4 p-0">
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Activity & Statistics
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
										{/* Projects */}
										<Card
											padding="md"
											className="bg-card/50"
										>
											<div className="flex items-start gap-4">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Zap className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Projects
													</p>
													<p className="font-medium text-2xl">
														{projects.length}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														Active projects
													</p>
												</div>
											</div>
										</Card>

										{/* Tasks */}
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
														Tasks
													</p>
													<p className="font-medium text-2xl">{tasks.length}</p>
													<p className="text-xs text-muted-foreground mt-1">
														Total tasks
													</p>
												</div>
											</div>
										</Card>

										{/* Completed Tasks */}
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
														Completed
													</p>
													<p className="font-medium text-2xl">
														{tasks.filter((t) => t.progress === 100).length}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														Finished tasks
													</p>
												</div>
											</div>
										</Card>

										{/* Team Members */}
										<Card
											padding="md"
											className="bg-card/50"
										>
											<div className="flex items-start gap-4">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Users className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Collaboration
													</p>
													<p className="font-medium text-2xl">
														{projects.length > 0 ? "Active" : "0"}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														Team members
													</p>
												</div>
											</div>
										</Card>
									</div>
								</CardContent>
							</Card>

							{/* Connected Accounts */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-4 p-0">
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Connected Accounts
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{/* Google Account */}
										<Card
											padding="md"
											className="bg-card/50 flex items-center justify-between gap-4"
										>
											<div className="flex items-center gap-4 flex-1">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Mail className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Google
													</p>
													<p className="font-medium text-lg">
														{user?.email || "Not connected"}
													</p>
												</div>
											</div>
											{user?.email ? (
												<Badge variant="outline">Connected</Badge>
											) : (
												<Button
													variant="outline"
													size="sm"
												>
													Connect
												</Button>
											)}
										</Card>

										{/* Email Account */}
										<Card
											padding="md"
											className="bg-card/50 flex items-center justify-between gap-4"
										>
											<div className="flex items-center gap-4 flex-1">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Mail className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Email Account
													</p>
													<p className="font-medium text-lg">
														{user?.email || "Not set"}
													</p>
												</div>
											</div>
											<Badge variant="outline">Primary</Badge>
										</Card>
									</div>
								</CardContent>
							</Card>

							{/* Data & Privacy */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-4 p-0">
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Data & Privacy
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{/* Export Data */}
										<Card
											padding="md"
											className="bg-card/50 flex items-center justify-between gap-4"
										>
											<div className="flex items-start gap-4 flex-1">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<FileText className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Export Data
													</p>
													<p className="font-medium text-lg">
														Download your data
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														Get a copy of all your data in JSON format
													</p>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
											>
												Export
											</Button>
										</Card>

										{/* Privacy Settings */}
										<Card
											padding="md"
											className="bg-card/50 flex items-center justify-between gap-4"
										>
											<div className="flex items-start gap-4 flex-1">
												<div className="p-2 retro-border rounded-none bg-primary/10">
													<Settings className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Privacy Settings
													</p>
													<p className="font-medium text-lg">Manage privacy</p>
													<p className="text-xs text-muted-foreground mt-1">
														Control who can see your profile and activity
													</p>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
											>
												Manage
											</Button>
										</Card>

										{/* Delete Account */}
										<Card
											padding="md"
											className="bg-card/50 border-destructive/20"
										>
											<div className="flex items-start gap-4">
												<div className="p-2 retro-border rounded-none bg-destructive/10">
													<Trash2 className="h-5 w-5 text-destructive" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
														Delete Account
													</p>
													<p className="font-medium text-lg text-destructive">
														Permanently delete your account
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														This action cannot be undone. All your data will be
														permanently deleted.
													</p>
													<Button
														variant="destructive"
														size="sm"
														className="mt-3"
													>
														Delete Account
													</Button>
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
