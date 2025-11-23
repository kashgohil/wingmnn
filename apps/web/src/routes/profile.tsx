import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { Key, Mail, User } from "lucide-react";
import { AuthenticatedLayout } from "../components/AuthenticatedLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useAuth } from "../lib/auth/auth-context";

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

	return (
		<ProtectedRoute>
			<AuthenticatedLayout>
				<div className="min-h-screen bg-background text-foreground">
					<div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 pt-36 sm:pt-6 pb-24">
						<div className="space-y-8">
							{/* Header Section */}
							<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<div className="flex items-center gap-6">
									<div className="p-4 retro-border rounded-none bg-primary/10">
										<User className="h-12 w-12 text-primary" />
									</div>
									<div>
										<h1 className="text-4xl font-bold mb-2 font-mono uppercase tracking-wider">
											{user?.name || "User Profile"}
										</h1>
										<p className="text-muted-foreground">
											Manage your account settings and preferences
										</p>
									</div>
								</div>
							</div>

							{/* Profile Information */}
							<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<h2 className="text-2xl font-bold mb-6 font-mono uppercase tracking-wider">
									Profile Information
								</h2>
								<div className="space-y-6">
									{/* Name */}
									<div className="flex items-start gap-4 p-4 retro-border bg-card/50 rounded-none">
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
									</div>

									{/* Email */}
									<div className="flex items-start gap-4 p-4 retro-border bg-card/50 rounded-none">
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
									</div>

									{/* User ID */}
									<div className="flex items-start gap-4 p-4 retro-border bg-card/50 rounded-none">
										<div className="p-2 retro-border rounded-none bg-primary/10">
											<Key className="h-5 w-5 text-primary" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
												User ID
											</p>
											<p className="font-mono text-sm">{user?.id || "N/A"}</p>
										</div>
									</div>
								</div>
							</div>

							{/* Account Settings */}
							<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<h2 className="text-2xl font-bold mb-6 font-mono uppercase tracking-wider">
									Account Settings
								</h2>
								<div className="space-y-4">
									<div className="p-4 retro-border bg-card/50 rounded-none">
										<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
											Account Status
										</p>
										<p className="font-medium">Active</p>
									</div>
									<div className="p-4 retro-border bg-card/50 rounded-none">
										<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
											Account Type
										</p>
										<p className="font-medium">Standard</p>
									</div>
								</div>
							</div>

							{/* Quick Actions */}
							<div className="retro-border bg-card/80 backdrop-blur-sm p-8 rounded-none">
								<h2 className="text-2xl font-bold mb-6 font-mono uppercase tracking-wider">
									Quick Actions
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="p-4 retro-border bg-card/50 rounded-none hover:bg-card/70 transition-colors cursor-pointer">
										<p className="font-medium mb-1">View Dashboard</p>
										<p className="text-sm text-muted-foreground">
											Go to your workspace dashboard
										</p>
									</div>
									<div className="p-4 retro-border bg-card/50 rounded-none hover:bg-card/70 transition-colors cursor-pointer">
										<p className="font-medium mb-1">Security Settings</p>
										<p className="text-sm text-muted-foreground">
											Manage your security preferences
										</p>
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
