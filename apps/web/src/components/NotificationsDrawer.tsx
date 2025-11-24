/**
 * Notifications Drawer Component
 * Displays all notifications in a side drawer
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck } from "lucide-react";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
	listNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	type Notification,
} from "@/lib/api/notifications.api";
import { catchError } from "@wingmnn/utils/catch-error";
import { cn } from "@/lib/utils";

interface NotificationsDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NotificationsDrawer({
	open,
	onOpenChange,
}: NotificationsDrawerProps) {
	const queryClient = useQueryClient();

	const { data: notifications = [], isLoading, refetch } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listNotifications(),
		staleTime: 30 * 1000, // 30 seconds
	});

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const handleMarkAsRead = async (notificationId: string) => {
		const [, error] = await catchError(
			markNotificationAsRead(notificationId)
		);
		if (!error) {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		}
	};

	const handleMarkAllAsRead = async () => {
		const [, error] = await catchError(markAllNotificationsAsRead());
		if (!error) {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		}
	};

	const getNotificationTypeColor = (type: string) => {
		switch (type) {
			case "assignment":
				return "bg-primary/20 text-primary";
			case "status_change":
				return "bg-blue-500/20 text-blue-500";
			case "mention":
				return "bg-purple-500/20 text-purple-500";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent side="right" className="max-w-md">
				<DrawerHeader className="border-b border-border pb-4">
					<div className="flex items-center justify-between">
						<div>
							<DrawerTitle className="text-2xl">Notifications</DrawerTitle>
							<DrawerDescription>
								{unreadCount > 0
									? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
									: "All caught up!"}
							</DrawerDescription>
						</div>
						{unreadCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleMarkAllAsRead}
								className="gap-2"
							>
								<CheckCheck className="h-4 w-4" />
								Mark all read
							</Button>
						)}
					</div>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto p-4 space-y-3">
					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							Loading notifications...
						</div>
					) : notifications.length === 0 ? (
						<div className="text-center py-8 space-y-2">
							<Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
							<p className="text-muted-foreground font-mono uppercase tracking-wider">
								No notifications
							</p>
							<p className="text-sm text-muted-foreground">
								You're all caught up!
							</p>
						</div>
					) : (
						notifications.map((notification) => (
							<NotificationCard
								key={notification.id}
								notification={notification}
								onMarkAsRead={handleMarkAsRead}
								getNotificationTypeColor={getNotificationTypeColor}
							/>
						))
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}

interface NotificationCardProps {
	notification: Notification;
	onMarkAsRead: (id: string) => void;
	getNotificationTypeColor: (type: string) => string;
}

function NotificationCard({
	notification,
	onMarkAsRead,
	getNotificationTypeColor,
}: NotificationCardProps) {
	const isRead = notification.isRead;

	return (
		<Card
			padding="md"
			className={cn(
				"bg-card/80 backdrop-blur-sm transition-all",
				!isRead && "border-primary/50 bg-primary/5"
			)}
		>
			<CardContent className="p-0">
				<div className="flex items-start gap-3">
					<div className="flex-1 space-y-2">
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<Badge
										variant="outline"
										className={cn(
											"text-xs font-mono uppercase tracking-wider",
											getNotificationTypeColor(notification.type)
										)}
									>
										{notification.type}
									</Badge>
									{!isRead && (
										<div className="h-2 w-2 rounded-full bg-primary" />
									)}
								</div>
								<h4
									className={cn(
										"font-semibold text-sm",
										!isRead && "font-bold"
									)}
								>
									{notification.title}
								</h4>
								<p className="text-sm text-muted-foreground">
									{notification.message}
								</p>
							</div>
							{!isRead && (
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => onMarkAsRead(notification.id)}
									className="shrink-0"
									aria-label="Mark as read"
								>
									<Check className="h-4 w-4" />
								</Button>
							)}
						</div>
						<p className="text-xs text-muted-foreground font-mono">
							{formatTimeAgo(new Date(notification.createdAt))}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return "just now";
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
	}

	const diffInWeeks = Math.floor(diffInDays / 7);
	if (diffInWeeks < 4) {
		return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
	}

	const diffInMonths = Math.floor(diffInDays / 30);
	return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
}

