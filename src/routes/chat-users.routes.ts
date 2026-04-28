import { Router } from "express";
import { getChatUsersHandler } from "../controller/chat.controller";
import { authenticateAccessToken } from "../middlewares/authenticate";

const chatUsersRouter = Router();

chatUsersRouter.use(authenticateAccessToken);

chatUsersRouter.get("/", getChatUsersHandler);

export default chatUsersRouter;
