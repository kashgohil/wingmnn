/**
 * Notifications API Service
 *
 * Type-safe API calls for notification-related operations
 */

import { catchError } from "@wingmnn/utils/catch-error";
import { api } from "../eden-client";

export interface Notification {
	id: string;
	userId: string;
	projectId: string | null;
	relatedEntityType: "task" | "subtask" | null;
	relatedEntityId: string | null;
	type: string;
	title: string;
	message: string;
	isRead: boolean | null;
	readAt: Date | null;
	createdAt: Date;
}

export interface ListNotificationsParams {
	unreadOnly?: boolean;
}

/**
 * List all notifications for the authenticated user
 */
export async function listNotifications(params?: ListNotificationsParams) {
	const query: Record<string, string> = {};

	if (params?.unreadOnly) {
		query.unreadOnly = "true";
	}

	const [response, error] = await catchError(
		api.notifications.get(query)
	);

	if (error) {
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to fetch notifications"
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to fetch notifications"
		);
	}

	return (response?.data as { notifications?: Notification[] })
		?.notifications || [];
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
	const [response, error] = await catchError(
		api.notifications({ id: notificationId }).read.patch()
	);

	if (error) {
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to mark notification as read"
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to mark notification as read"
		);
	}

	return response?.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
	const [response, error] = await catchError(
		api.notifications.readAll.post()
	);

	if (error) {
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to mark all notifications as read"
		);
	}

	if (response?.error) {
		throw new Error(
			typeof response.error === "object" && "message" in response.error
				? String(response.error.message)
				: "Failed to mark all notifications as read"
		);
	}

	return response?.data;
}

