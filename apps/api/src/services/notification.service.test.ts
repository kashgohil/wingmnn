import {
  db,
  eq,
  notifications,
  projects,
  subtasks,
  tasks,
  users,
  workflows,
  workflowStatuses,
} from "@wingmnn/db";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import "../test-setup";
import {
  NotificationError,
  NotificationErrorCode,
  notificationService,
} from "./notification.service";

describe("NotificationService", () => {
  let testUserId: string;
  let testUserId2: string;
  let testProjectId: string;
  let testWorkflowId: string;
  let testStatusId: string;
  let testTaskId: string;
  let testSubtaskId: string;

  // Create test users before all tests
  beforeAll(async () => {
    const result1 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "notification-test@example.com",
        name: "Notification Test User",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId = result1[0].id;

    const result2 = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: "notification-test2@example.com",
        name: "Notification Test User 2",
        bio: "",
        passwordHash: null,
      })
      .returning();
    testUserId2 = result2[0].id;
  });

  // Clean up test users after all tests
  afterAll(async () => {
    if (testUserId) {
      await db
        .delete(notifications)
        .where(eq(notifications.userId, testUserId));
      await db.delete(subtasks);
      await db.delete(tasks).where(eq(tasks.createdBy, testUserId));
      await db.delete(projects).where(eq(projects.ownerId, testUserId));
      await db.delete(workflowStatuses);
      await db.delete(workflows).where(eq(workflows.createdBy, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
    if (testUserId2) {
      await db
        .delete(notifications)
        .where(eq(notifications.userId, testUserId2));
      await db.delete(users).where(eq(users.id, testUserId2));
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await db.delete(notifications);
    await db.delete(subtasks);
    await db.delete(tasks).where(eq(tasks.createdBy, testUserId));
    await db.delete(projects).where(eq(projects.ownerId, testUserId));
    await db.delete(workflowStatuses);
    await db.delete(workflows).where(eq(workflows.createdBy, testUserId));

    // Create test workflow
    testWorkflowId = crypto.randomUUID();
    await db.insert(workflows).values({
      id: testWorkflowId,
      name: "Test Workflow",
      workflowType: "task",
      createdBy: testUserId,
      isTemplate: false,
    });

    // Create test status
    testStatusId = crypto.randomUUID();
    await db.insert(workflowStatuses).values({
      id: testStatusId,
      workflowId: testWorkflowId,
      name: "To Do",
      phase: "backlog",
      colorCode: "#808080",
      position: 1,
    });

    // Create test project
    testProjectId = crypto.randomUUID();
    await db.insert(projects).values({
      id: testProjectId,
      name: "Test Project",
      ownerId: testUserId,
      workflowId: testWorkflowId,
      status: "active",
      createdBy: testUserId,
      updatedBy: testUserId,
    });

    // Create test task
    testTaskId = crypto.randomUUID();
    await db.insert(tasks).values({
      id: testTaskId,
      projectId: testProjectId,
      title: "Test Task",
      statusId: testStatusId,
      priority: "medium",
      progress: 0,
      createdBy: testUserId,
      updatedBy: testUserId,
    });

    // Create test subtask workflow
    const subtaskWorkflowId = crypto.randomUUID();
    await db.insert(workflows).values({
      id: subtaskWorkflowId,
      name: "Subtask Workflow",
      workflowType: "subtask",
      createdBy: testUserId,
      isTemplate: false,
    });

    const subtaskStatusId = crypto.randomUUID();
    await db.insert(workflowStatuses).values({
      id: subtaskStatusId,
      workflowId: subtaskWorkflowId,
      name: "To Do",
      phase: "backlog",
      colorCode: "#808080",
      position: 1,
    });

    // Create test subtask
    testSubtaskId = crypto.randomUUID();
    await db.insert(subtasks).values({
      id: testSubtaskId,
      taskId: testTaskId,
      title: "Test Subtask",
      statusId: subtaskStatusId,
      priority: "medium",
      progress: 0,
    });
  });

  describe("createNotification", () => {
    test("should create a notification with all fields", async () => {
      await notificationService.createNotification({
        userId: testUserId,
        projectId: testProjectId,
        relatedEntityType: "task",
        relatedEntityId: testTaskId,
        type: "assignment",
        title: "Test Notification",
        message: "This is a test notification",
      });

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId));

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(testUserId);
      expect(result[0].projectId).toBe(testProjectId);
      expect(result[0].relatedEntityType).toBe("task");
      expect(result[0].relatedEntityId).toBe(testTaskId);
      expect(result[0].type).toBe("assignment");
      expect(result[0].title).toBe("Test Notification");
      expect(result[0].message).toBe("This is a test notification");
      expect(result[0].isRead).toBe(false);
      expect(result[0].readAt).toBeNull();
    });

    test("should create a notification without optional fields", async () => {
      await notificationService.createNotification({
        userId: testUserId,
        type: "system",
        title: "System Notification",
        message: "System message",
      });

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId));

      expect(result).toHaveLength(1);
      expect(result[0].projectId).toBeNull();
      expect(result[0].relatedEntityType).toBeNull();
      expect(result[0].relatedEntityId).toBeNull();
    });
  });

  describe("createAssignmentNotification", () => {
    test("should create notification for task assignment", async () => {
      await notificationService.createAssignmentNotification(
        testTaskId,
        testUserId2,
        testUserId
      );

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId2));

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("assignment");
      expect(result[0].title).toBe("Task Assigned");
      expect(result[0].message).toContain("Test Task");
      expect(result[0].relatedEntityType).toBe("task");
      expect(result[0].relatedEntityId).toBe(testTaskId);
      expect(result[0].projectId).toBe(testProjectId);
    });

    test("should not create notification if task does not exist", async () => {
      await notificationService.createAssignmentNotification(
        "non-existent-task",
        testUserId2,
        testUserId
      );

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId2));

      expect(result).toHaveLength(0);
    });
  });

  describe("createSubtaskAssignmentNotification", () => {
    test("should create notification for subtask assignment", async () => {
      await notificationService.createSubtaskAssignmentNotification(
        testSubtaskId,
        testUserId2,
        testUserId
      );

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId2));

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("assignment");
      expect(result[0].title).toBe("Subtask Assigned");
      expect(result[0].message).toContain("Test Subtask");
      expect(result[0].relatedEntityType).toBe("subtask");
      expect(result[0].relatedEntityId).toBe(testSubtaskId);
      expect(result[0].projectId).toBe(testProjectId);
    });
  });

  describe("createTaskStatusChangeNotification", () => {
    test("should create notification for task status change", async () => {
      // Assign task to user2
      await db
        .update(tasks)
        .set({ assignedTo: testUserId2 })
        .where(eq(tasks.id, testTaskId));

      await notificationService.createTaskStatusChangeNotification(
        testTaskId,
        "To Do",
        "In Progress",
        testUserId
      );

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId2));

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("status_change");
      expect(result[0].title).toBe("Task Status Changed");
      expect(result[0].message).toContain("To Do");
      expect(result[0].message).toContain("In Progress");
      expect(result[0].relatedEntityType).toBe("task");
      expect(result[0].relatedEntityId).toBe(testTaskId);
    });

    test("should not create notification if task is not assigned", async () => {
      await notificationService.createTaskStatusChangeNotification(
        testTaskId,
        "To Do",
        "In Progress",
        testUserId
      );

      const result = await db.select().from(notifications);

      expect(result).toHaveLength(0);
    });

    test("should not create notification if user changed their own task status", async () => {
      // Assign task to user1
      await db
        .update(tasks)
        .set({ assignedTo: testUserId })
        .where(eq(tasks.id, testTaskId));

      await notificationService.createTaskStatusChangeNotification(
        testTaskId,
        "To Do",
        "In Progress",
        testUserId
      );

      const result = await db.select().from(notifications);

      expect(result).toHaveLength(0);
    });
  });

  describe("createSubtaskStatusChangeNotification", () => {
    test("should create notification for subtask status change", async () => {
      // Assign subtask to user2
      await db
        .update(subtasks)
        .set({ assignedTo: testUserId2 })
        .where(eq(subtasks.id, testSubtaskId));

      await notificationService.createSubtaskStatusChangeNotification(
        testSubtaskId,
        "To Do",
        "In Progress",
        testUserId
      );

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId2));

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("status_change");
      expect(result[0].title).toBe("Subtask Status Changed");
      expect(result[0].message).toContain("To Do");
      expect(result[0].message).toContain("In Progress");
      expect(result[0].relatedEntityType).toBe("subtask");
      expect(result[0].relatedEntityId).toBe(testSubtaskId);
    });

    test("should not notify user who made the change", async () => {
      // Assign subtask to user1
      await db
        .update(subtasks)
        .set({ assignedTo: testUserId })
        .where(eq(subtasks.id, testSubtaskId));

      await notificationService.createSubtaskStatusChangeNotification(
        testSubtaskId,
        "To Do",
        "In Progress",
        testUserId
      );

      const result = await db.select().from(notifications);

      expect(result).toHaveLength(0);
    });
  });

  describe("listNotifications", () => {
    test("should list all notifications for a user", async () => {
      // Create multiple notifications
      await notificationService.createNotification({
        userId: testUserId,
        type: "test1",
        title: "Notification 1",
        message: "Message 1",
      });

      await notificationService.createNotification({
        userId: testUserId,
        type: "test2",
        title: "Notification 2",
        message: "Message 2",
      });

      await notificationService.createNotification({
        userId: testUserId2,
        type: "test3",
        title: "Notification 3",
        message: "Message 3",
      });

      const result = await notificationService.listNotifications(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(testUserId);
      expect(result[1].userId).toBe(testUserId);
    });

    test("should list only unread notifications when unreadOnly is true", async () => {
      // Create notifications
      const notif1Id = crypto.randomUUID();
      await db.insert(notifications).values({
        id: notif1Id,
        userId: testUserId,
        type: "test1",
        title: "Notification 1",
        message: "Message 1",
        isRead: false,
      });

      const notif2Id = crypto.randomUUID();
      await db.insert(notifications).values({
        id: notif2Id,
        userId: testUserId,
        type: "test2",
        title: "Notification 2",
        message: "Message 2",
        isRead: true,
        readAt: new Date(),
      });

      const result = await notificationService.listNotifications(
        testUserId,
        true
      );

      expect(result).toHaveLength(1);
      expect(result[0].isRead).toBe(false);
    });

    test("should return notifications ordered by creation date descending", async () => {
      // Create notifications with slight delay
      await notificationService.createNotification({
        userId: testUserId,
        type: "test1",
        title: "First",
        message: "Message 1",
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await notificationService.createNotification({
        userId: testUserId,
        type: "test2",
        title: "Second",
        message: "Message 2",
      });

      const result = await notificationService.listNotifications(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Second");
      expect(result[1].title).toBe("First");
    });
  });

  describe("markAsRead", () => {
    test("should mark a notification as read", async () => {
      const notifId = crypto.randomUUID();
      await db.insert(notifications).values({
        id: notifId,
        userId: testUserId,
        type: "test",
        title: "Test",
        message: "Test message",
        isRead: false,
      });

      await notificationService.markAsRead(notifId, testUserId);

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, notifId));

      expect(result).toHaveLength(1);
      expect(result[0].isRead).toBe(true);
      expect(result[0].readAt).not.toBeNull();
    });

    test("should throw error if notification does not exist", async () => {
      await expect(
        notificationService.markAsRead("non-existent", testUserId)
      ).rejects.toThrow(NotificationError);

      try {
        await notificationService.markAsRead("non-existent", testUserId);
      } catch (error) {
        expect((error as NotificationError).code).toBe(
          NotificationErrorCode.NOTIFICATION_NOT_FOUND
        );
        expect((error as NotificationError).statusCode).toBe(404);
      }
    });

    test("should throw error if user does not own the notification", async () => {
      const notifId = crypto.randomUUID();
      await db.insert(notifications).values({
        id: notifId,
        userId: testUserId,
        type: "test",
        title: "Test",
        message: "Test message",
        isRead: false,
      });

      await expect(
        notificationService.markAsRead(notifId, testUserId2)
      ).rejects.toThrow(NotificationError);

      try {
        await notificationService.markAsRead(notifId, testUserId2);
      } catch (error) {
        expect((error as NotificationError).code).toBe(
          NotificationErrorCode.FORBIDDEN
        );
        expect((error as NotificationError).statusCode).toBe(403);
      }
    });
  });

  describe("markAllAsRead", () => {
    test("should mark all unread notifications as read", async () => {
      // Create multiple unread notifications
      await db.insert(notifications).values([
        {
          id: crypto.randomUUID(),
          userId: testUserId,
          type: "test1",
          title: "Test 1",
          message: "Message 1",
          isRead: false,
        },
        {
          id: crypto.randomUUID(),
          userId: testUserId,
          type: "test2",
          title: "Test 2",
          message: "Message 2",
          isRead: false,
        },
        {
          id: crypto.randomUUID(),
          userId: testUserId2,
          type: "test3",
          title: "Test 3",
          message: "Message 3",
          isRead: false,
        },
      ]);

      await notificationService.markAllAsRead(testUserId);

      const user1Notifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId));

      const user2Notifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId2));

      expect(user1Notifications).toHaveLength(2);
      expect(user1Notifications.every((n) => n.isRead === true)).toBe(true);
      expect(user1Notifications.every((n) => n.readAt !== null)).toBe(true);

      expect(user2Notifications).toHaveLength(1);
      expect(user2Notifications[0].isRead).toBe(false);
    });

    test("should not affect already read notifications", async () => {
      const readAt = new Date("2024-01-01");
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: testUserId,
        type: "test",
        title: "Test",
        message: "Message",
        isRead: true,
        readAt,
      });

      await notificationService.markAllAsRead(testUserId);

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId));

      expect(result).toHaveLength(1);
      expect(result[0].isRead).toBe(true);
      expect(result[0].readAt?.getTime()).toBe(readAt.getTime());
    });
  });
});
