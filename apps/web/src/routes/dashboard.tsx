import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "../components/AuthenticatedLayout";
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

	return (
		<ProtectedRoute>
			<AuthenticatedLayout>
				<div className="min-h-screen bg-background text-foreground">
					<div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 pt-36 sm:pt-6 pb-24">
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
										<p className="text-3xl font-bold">12</p>
									</CardContent>
								</Card>
								<Card
									padding="md"
									className="backdrop-blur-sm bg-card/80"
								>
									<CardHeader className="mb-2 p-0">
										<CardDescription className="text-sm font-mono uppercase tracking-wider">
											Unread Messages
										</CardDescription>
									</CardHeader>
									<CardContent className="p-0">
										<p className="text-3xl font-bold">47</p>
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
										<p className="text-3xl font-bold">8</p>
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
											<p className="text-sm text-muted-foreground mb-1">
												Email
											</p>
											<p className="font-medium">{user?.email}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</AuthenticatedLayout>
		</ProtectedRoute>
	);
}
