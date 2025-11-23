import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "../components/AuthenticatedLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
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

	return (
		<ProtectedRoute>
			<AuthenticatedLayout>
				<div className="min-h-screen bg-background text-foreground">
					<div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 pt-36 sm:pt-6 pb-24">
						<div className="space-y-8">
							{/* Welcome Section */}
							<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<h1 className="text-4xl font-bold mb-2 font-mono uppercase tracking-wider">
									Welcome back, {user?.name}!
								</h1>
								<p className="text-muted-foreground">
									Here's your workspace overview
								</p>
							</div>

							{/* Quick Stats */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none">
									<h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
										Active Projects
									</h3>
									<p className="text-3xl font-bold">12</p>
								</div>
								<div className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none">
									<h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
										Unread Messages
									</h3>
									<p className="text-3xl font-bold">47</p>
								</div>
								<div className="retro-border bg-card/80 backdrop-blur-sm p-6 rounded-none">
									<h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
										Tasks Due Today
									</h3>
									<p className="text-3xl font-bold">8</p>
								</div>
							</div>

							{/* Recent Activity */}
							<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<h2 className="text-2xl font-bold mb-6 font-mono uppercase tracking-wider">
									Recent Activity
								</h2>
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
										<div
											key={idx}
											className="flex items-center justify-between p-4 retro-border bg-card/50 rounded-none"
										>
											<div>
												<p className="font-medium">{activity.action}</p>
												<p className="text-sm text-muted-foreground">
													{activity.item}
												</p>
											</div>
											<span className="text-sm text-muted-foreground">
												{activity.time}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* User Info */}
							<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<h2 className="text-2xl font-bold mb-6 font-mono uppercase tracking-wider">
									Account Details
								</h2>
								<div className="space-y-4">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Name</p>
										<p className="font-medium">{user?.name}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Email</p>
										<p className="font-medium">{user?.email}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">
											User ID
										</p>
										<p className="font-mono text-sm">{user?.id}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</AuthenticatedLayout>
		</ProtectedRoute>
	);
}
