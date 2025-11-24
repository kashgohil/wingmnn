import { SoftRetroGridBackground } from "@/components/backgrounds/RetroGridPatterns";
import { listNotifications } from "@/lib/api/notifications.api";
import { useProjects } from "@/lib/hooks/use-projects";
import { useMyTasks } from "@/lib/hooks/use-tasks";
import { generateMetadata } from "@/lib/metadata";
import { modules } from "@/lib/modules";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { useAuth } from "../lib/auth/auth-context";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
	head: () =>
		generateMetadata({
			title: "Dashboard",
			description: "Your Wingmnn workspace dashboard",
			noindex: true,
		}),
});

function Dashboard() {
	const { user } = useAuth();
	const { data: projects = [] } = useProjects();
	const { data: tasks = [] } = useMyTasks();
	const { data: notifications = [] } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listNotifications(),
		staleTime: 30 * 1000,
	});

	// Calculate stats
	const activeProjects = projects.length;
	const myTasks = tasks.filter((t) => t.assignedTo === user?.id);
	const tasksDueToday = myTasks.filter((task) => {
		if (!task.dueDate) return false;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const dueDate = new Date(task.dueDate);
		dueDate.setHours(0, 0, 0, 0);
		return dueDate.getTime() === today.getTime();
	}).length;
	const unreadNotifications = notifications.filter((n) => !n.isRead).length;
	const completedTasks = tasks.filter((t) => t.progress === 100).length;

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-background text-foreground">
				<SoftRetroGridBackground className="absolute inset-0 overflow-hidden opacity-40" />
				<div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 pt-36 sm:pt-8 pb-24">
					<div className="space-y-8">
						{/* Welcome Section */}
						<Card
							padding="lg"
							className="backdrop-blur-sm bg-card/80"
						>
							<CardHeader>
								<CardTitle className="text-4xl font-bold font-mono uppercase tracking-wider">
									Welcome back, {user?.name}!
								</CardTitle>
								<CardDescription className="text-base">
									Here's your workspace overview
								</CardDescription>
							</CardHeader>
						</Card>

						{/* Module Summary Widgets */}
						<div>
							<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider mb-6">
								Overview
							</CardTitle>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{modules.map((module) => {
									const Icon = module.icon;
									const moduleStats = getModuleStats(module.slug, {
										projects,
										tasks: myTasks,
										notifications,
										completedTasks,
										tasksDueToday,
										activeProjects,
										unreadNotifications,
									});

									return (
										<Link
											key={module.slug}
											to={`/${module.slug}` as any}
											className="block"
										>
											<Card
												padding="md"
												className="backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all cursor-pointer retro-border"
												style={{
													borderColor: `var(${module.colorVar})`,
												}}
											>
												<CardHeader className="mb-3 p-0">
													<div className="flex items-center gap-3 mb-2">
														<div
															className="p-2 retro-border rounded-none"
															style={{
																backgroundColor: `var(${module.colorVar})`,
															}}
														>
															<Icon className="h-5 w-5 text-foreground dark:text-primary-foreground" />
														</div>
														<CardTitle className="text-lg font-bold font-mono uppercase tracking-wider">
															{module.name}
														</CardTitle>
													</div>
												</CardHeader>
												<CardContent className="p-0 space-y-2">
													{moduleStats.map((stat, idx) => (
														<div
															key={idx}
															className="flex items-center justify-between text-sm"
														>
															<span className="text-muted-foreground font-mono uppercase tracking-wider text-xs">
																{stat.label}
															</span>
															<span className="font-bold">{stat.value}</span>
														</div>
													))}
												</CardContent>
											</Card>
										</Link>
									);
								})}
							</div>
						</div>

						{/* Quick Stats */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card
								padding="md"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-2 p-0">
									<CardDescription className="text-sm font-mono uppercase tracking-wider">
										Active Projects
									</CardDescription>
								</CardHeader>
								<CardContent className="p-0">
									<p className="text-3xl font-bold">{activeProjects}</p>
								</CardContent>
							</Card>
							<Card
								padding="md"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-2 p-0">
									<CardDescription className="text-sm font-mono uppercase tracking-wider">
										Unread Notifications
									</CardDescription>
								</CardHeader>
								<CardContent className="p-0">
									<p className="text-3xl font-bold">{unreadNotifications}</p>
								</CardContent>
							</Card>
							<Card
								padding="md"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader className="mb-2 p-0">
									<CardDescription className="text-sm font-mono uppercase tracking-wider">
										Tasks Due Today
									</CardDescription>
								</CardHeader>
								<CardContent className="p-0">
									<p className="text-3xl font-bold">{tasksDueToday}</p>
								</CardContent>
							</Card>
						</div>

						{/* Recent Activity */}
						<Card
							padding="lg"
							className="backdrop-blur-sm bg-card/80"
						>
							<CardHeader>
								<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
									Recent Activity
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{[
										{
											action: "Completed task",
											item: "Update documentation",
											time: "2 hours ago",
										},
										{
											action: "New message from",
											item: "Sarah Chen",
											time: "4 hours ago",
										},
										{
											action: "Project milestone",
											item: "Q1 Planning Complete",
											time: "Yesterday",
										},
									].map((activity, idx) => (
										<Card
											key={idx}
											padding="md"
											className="bg-card/50 flex items-center justify-between"
										>
											<CardContent className="flex-1 p-0">
												<p className="font-medium">{activity.action}</p>
												<p className="text-sm text-muted-foreground">
													{activity.item}
												</p>
											</CardContent>
											<span className="text-sm text-muted-foreground">
												{activity.time}
											</span>
										</Card>
									))}
								</div>
							</CardContent>
						</Card>

						{/* User Info */}
						<Card
							padding="lg"
							className="backdrop-blur-sm bg-card/80"
						>
							<CardHeader>
								<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
									Account Details
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Name</p>
										<p className="font-medium">{user?.name}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Email</p>
										<p className="font-medium">{user?.email}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}

function getModuleStats(
	slug: string,
	data: {
		projects: any[];
		tasks: any[];
		notifications: any[];
		completedTasks: number;
		tasksDueToday: number;
		activeProjects: number;
		unreadNotifications: number;
	},
): Array<{ label: string; value: string | number }> {
	switch (slug) {
		case "projects":
			return [
				{ label: "Active", value: data.activeProjects },
				{ label: "Total Tasks", value: data.tasks.length },
				{ label: "Completed", value: data.completedTasks },
				{ label: "Due Today", value: data.tasksDueToday },
			];
		case "mails":
			return [
				{ label: "Status", value: "Coming Soon" },
				{ label: "Inbox", value: "—" },
				{ label: "Unread", value: "—" },
				{ label: "Priority", value: "—" },
			];
		case "notes":
			return [
				{ label: "Status", value: "Coming Soon" },
				{ label: "Total Notes", value: "—" },
				{ label: "Recent", value: "—" },
				{ label: "Backlinks", value: "—" },
			];
		case "finance":
			return [
				{ label: "Status", value: "Coming Soon" },
				{ label: "Transactions", value: "—" },
				{ label: "Pending", value: "—" },
				{ label: "Balance", value: "—" },
			];
		case "feeds":
			return [
				{ label: "Status", value: "Coming Soon" },
				{ label: "Subscriptions", value: "—" },
				{ label: "Unread", value: "—" },
				{ label: "Today", value: "—" },
			];
		case "messages":
			return [
				{ label: "Status", value: "Coming Soon" },
				{ label: "Conversations", value: "—" },
				{ label: "Unread", value: "—" },
				{ label: "Active", value: "—" },
			];
		case "calendar":
			return [
				{ label: "Status", value: "Coming Soon" },
				{ label: "Events", value: "—" },
				{ label: "Upcoming", value: "—" },
				{ label: "This Week", value: "—" },
			];
		case "wellness":
			return [
				{ label: "Status", value: "Coming Soon" },
				{ label: "Check-ins", value: "—" },
				{ label: "Streak", value: "—" },
				{ label: "Score", value: "—" },
			];
		case "files":
			return [
				{ label: "Status", value: "Coming Soon" },
				{ label: "Total Files", value: "—" },
				{ label: "Storage", value: "—" },
				{ label: "Shared", value: "—" },
			];
		case "fun":
			return [
				{ label: "Status", value: "Coming Soon" },
				{ label: "Activities", value: "—" },
				{ label: "Engagement", value: "—" },
				{ label: "Points", value: "—" },
			];
		default:
			return [{ label: "Status", value: "Coming Soon" }];
	}
}
