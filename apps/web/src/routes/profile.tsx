import { generateMetadata } from "@/lib/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, User } from "lucide-react";
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
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardContent className="p-0">
									<div className="flex items-center gap-6">
										<div className="p-4 retro-border rounded-none bg-primary/10">
											<User className="h-12 w-12 text-primary" />
										</div>
										<div>
											<CardTitle className="text-4xl font-bold mb-2 font-mono uppercase tracking-wider">
												{user?.name || "User Profile"}
											</CardTitle>
											<CardDescription className="text-base">
												Manage your account settings and preferences
											</CardDescription>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Profile Information */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader>
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
									</div>
								</CardContent>
							</Card>

							{/* Account Settings */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader>
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Account Settings
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<Card
											padding="md"
											className="bg-card/50"
										>
											<CardContent className="p-0">
												<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
													Account Status
												</p>
												<p className="font-medium">Active</p>
											</CardContent>
										</Card>
										<Card
											padding="md"
											className="bg-card/50"
										>
											<CardContent className="p-0">
												<p className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
													Account Type
												</p>
												<p className="font-medium">Standard</p>
											</CardContent>
										</Card>
									</div>
								</CardContent>
							</Card>

							{/* Quick Actions */}
							<Card
								padding="lg"
								className="backdrop-blur-sm bg-card/80"
							>
								<CardHeader>
									<CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
										Quick Actions
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<Card
											padding="md"
											variant="interactive"
											className="bg-card/50 hover:bg-card/70"
										>
											<CardContent className="p-0">
												<p className="font-medium mb-1">View Dashboard</p>
												<p className="text-sm text-muted-foreground">
													Go to your workspace dashboard
												</p>
											</CardContent>
										</Card>
										<Card
											padding="md"
											variant="interactive"
											className="bg-card/50 hover:bg-card/70"
										>
											<CardContent className="p-0">
												<p className="font-medium mb-1">Security Settings</p>
												<p className="text-sm text-muted-foreground">
													Manage your security preferences
												</p>
											</CardContent>
										</Card>
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
