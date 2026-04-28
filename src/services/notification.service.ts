import { AuthError } from "../errors/AuthError";
import {
  createNotification,
  deleteNotification,
  getNotificationsForUser,
  markNotificationAsRead,
} from "../repository/notification.repository";
import {
  type CreateNotificationInput,
  validateCreateNotificationInput,
} from "../validation/notification.validation";
import { validateObjectId } from "../validation/chat.validation";

export async function createUserNotification(
  userId: string,
  payload: CreateNotificationInput,
) {
  const input = validateCreateNotificationInput(payload);
  const notification = await createNotification({
    userId,
    type: input.type,
    title: input.title,
    body: input.body,
    metadata: input.metadata,
  });

  return notification;
}

export async function getUserNotifications(userId: string) {
  return getNotificationsForUser(userId);
}

export async function markUserNotificationAsRead(
  userId: string,
  notificationId: string,
) {
  const validNotificationId = validateObjectId(
    notificationId,
    "notificationId",
  );
  const notification = await markNotificationAsRead(
    validNotificationId,
    userId,
  );

  if (!notification) {
    throw new AuthError("Notification not found", 404);
  }

  return notification;
}

export async function deleteUserNotification(
  userId: string,
  notificationId: string,
) {
  const validNotificationId = validateObjectId(
    notificationId,
    "notificationId",
  );
  const deleted = await deleteNotification(validNotificationId, userId);

  if (!deleted) {
    throw new AuthError("Notification not found", 404);
  }

  return { deleted: true, notificationId: validNotificationId };
}
