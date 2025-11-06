import i18n from "@/i18n";
import { Group, Task } from "@/types";
import * as Notifications from "expo-notifications";
import { isSameDay, isSameISOWeek, isSameMonth } from "./date-helpers";
import {
  calculateNextDueDate,
  calculateNotificationDate,
  getAssignedMemberName,
} from "./notification-schedule";
import { getLastCompletedAt } from "./task-completion";
import { formatScheduleInfo } from "./task-schedule";

/**
 * Helper function to check if a task is completed for a specific date's period
 */
function isTaskCompletedForDate(task: Task, checkDate: Date): boolean {
  const lastCompletedAt = getLastCompletedAt(task);
  if (!lastCompletedAt) {
    return false;
  }

  const checkDateStart = new Date(checkDate);
  checkDateStart.setHours(0, 0, 0, 0);

  const lastCompleted = new Date(lastCompletedAt);
  lastCompleted.setHours(0, 0, 0, 0);

  const schedule = task.schedule;

  switch (schedule.repeat) {
    case "daily":
      // For daily tasks, check if completed on the same day
      return isSameDay(checkDateStart, lastCompleted);

    case "weekdays":
    case "weekends":
    case "weekly":
    case "biweekly":
      // For weekly tasks, check if completed in the same week (using ISO week)
      return isSameISOWeek(checkDateStart, lastCompleted);

    case "monthly":
    case "every3months":
    case "every6months":
      // For monthly tasks, check if completed in the same month
      return isSameMonth(checkDateStart, lastCompleted);

    case "yearly":
      // For yearly tasks, check if completed in the same year
      return checkDateStart.getFullYear() === lastCompleted.getFullYear();

    default:
      return false;
  }
}

/**
 * Schedule a notification for a task
 */
export async function scheduleTaskNotification(
  task: Task,
  group: Group,
  reminderMinutes: number
): Promise<void> {
  try {
    // Check if task has assigned members - if not, don't schedule notification
    const assignedMembers = group.members.filter((m) =>
      task.memberIds.includes(m.id)
    );

    if (assignedMembers.length === 0) {
      console.log(
        `Skipping notification for task ${task.id} - no assigned members`
      );
      return;
    }

    const notificationDate = calculateNotificationDate(task, reminderMinutes);

    if (!notificationDate) {
      // Task doesn't have a valid schedule or notification would be in the past
      return;
    }

    // Check if task is already completed for the period that contains the notification date
    // Use the due date (not notification date) to check the period
    const dueDate = calculateNextDueDate(task);
    if (dueDate && isTaskCompletedForDate(task, dueDate)) {
      console.log(
        `Skipping notification for task ${
          task.id
        } - already completed for period containing ${dueDate.toISOString()}`
      );
      return;
    }

    const assignedMemberName = getAssignedMemberName(task, group);
    const scheduleInfo = formatScheduleInfo(task);

    // Create notification content with translations
    // Check dateText instead of text, because text always contains repeat type (e.g., "Daily")
    // but dateText is empty when we can't calculate a next due date
    const notificationContent: Notifications.NotificationContentInput = {
      title: i18n.t("notifications.notificationTitle", { taskName: task.name }),
      body: scheduleInfo.dateText
        ? i18n.t("notifications.notificationBody", {
            memberName: assignedMemberName,
            scheduleInfo: scheduleInfo.text,
          })
        : i18n.t("notifications.notificationBodyNoSchedule", {
            memberName: assignedMemberName,
          }),
      sound: true,
      data: {
        taskId: task.id,
        groupId: group.id,
        type: "task_reminder",
      },
    };

    // Schedule the notification with a date trigger
    await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      },
    });

    console.log(
      `Scheduled notification for task ${
        task.id
      } at ${notificationDate.toISOString()}`
    );
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}

/**
 * Cancel a scheduled notification for a task
 */
export async function cancelTaskNotification(taskId: string): Promise<void> {
  try {
    // Cancel by looking up all scheduled notifications
    const allNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const taskNotifications = allNotifications.filter(
      (n) => n.content.data?.taskId === taskId
    );

    for (const notification of taskNotifications) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }

    if (taskNotifications.length > 0) {
      console.log(
        `Cancelled ${taskNotifications.length} notification(s) for task ${taskId}`
      );
    }
  } catch (error) {
    console.error("Error cancelling notification:", error);
  }
}

/**
 * Cancel all notifications for all tasks in a group
 */
export async function cancelAllTaskNotifications(
  groupId: string
): Promise<void> {
  try {
    const allNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const groupNotifications = allNotifications.filter(
      (n) => n.content.data?.groupId === groupId
    );

    for (const notification of groupNotifications) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }

    console.log(`Cancelled all notifications for group ${groupId}`);
  } catch (error) {
    console.error("Error cancelling group notifications:", error);
  }
}

/**
 * Reschedule all notifications for tasks in a group
 */
export async function rescheduleGroupNotifications(
  group: Group,
  reminderMinutes: number
): Promise<void> {
  try {
    // Cancel all existing notifications for this group
    await cancelAllTaskNotifications(group.id);

    // Schedule new notifications for all tasks
    for (const task of group.tasks) {
      await scheduleTaskNotification(task, group, reminderMinutes);
    }
  } catch (error) {
    console.error("Error rescheduling group notifications:", error);
  }
}
