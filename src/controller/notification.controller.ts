import type { NextFunction, Request, Response } from "express";
import {
  createUserNotification,
  deleteUserNotification,
  getUserNotifications,
  markUserNotificationAsRead,
} from "../services/notification.service";

function getAuthenticatedUserId(res: Response): string {
  const userId = res.locals.user?.sub as string | undefined;
  if (!userId) {
    throw new Error("Missing authenticated user context");
  }
  return userId;
}

export async function createNotificationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const notification = await createUserNotification(userId, req.body);
    res
      .status(201)
      .json({ message: "Notification created", data: notification });
  } catch (error) {
    next(error);
  }
}

export async function getNotificationsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const notifications = await getUserNotifications(userId);
    res.status(200).json({ data: notifications });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationReadHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const notificationId = Array.isArray(req.params.notificationId)
      ? req.params.notificationId[0]
      : req.params.notificationId;
    const notification = await markUserNotificationAsRead(
      userId,
      notificationId ?? "",
    );
    res
      .status(200)
      .json({ message: "Notification marked as read", data: notification });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotificationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const notificationId = Array.isArray(req.params.notificationId)
      ? req.params.notificationId[0]
      : req.params.notificationId;
    const result = await deleteUserNotification(userId, notificationId ?? "");
    res.status(200).json({ message: "Notification deleted", data: result });
  } catch (error) {
    next(error);
  }
}
