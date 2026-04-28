import { NotificationModel } from "../models/Notification";

export function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: unknown;
}) {
  return NotificationModel.create(input);
}

export function getNotificationsForUser(userId: string) {
  return NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean();
}

export function markNotificationAsRead(notificationId: string, userId: string) {
  return NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { readAt: new Date() },
    { new: true },
  );
}

export function deleteNotification(notificationId: string, userId: string) {
  return NotificationModel.findOneAndDelete({ _id: notificationId, userId });
}
