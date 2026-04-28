import { Router } from "express";
import { authenticateAccessToken } from "../middlewares/authenticate";
import {
  createNotificationHandler,
  deleteNotificationHandler,
  getNotificationsHandler,
  markNotificationReadHandler,
} from "../controller/notification.controller";

const notificationRouter = Router();

notificationRouter.use(authenticateAccessToken);

notificationRouter.post("/", createNotificationHandler);
notificationRouter.get("/", getNotificationsHandler);
notificationRouter.patch("/:notificationId/read", markNotificationReadHandler);
notificationRouter.delete("/:notificationId", deleteNotificationHandler);

export default notificationRouter;
