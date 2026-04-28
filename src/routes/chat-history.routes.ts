import { Router } from "express";
import { getChatHistoryHandler } from "../controller/chat.controller";
import { authenticateAccessToken } from "../middlewares/authenticate";

const chatHistoryRouter = Router();

chatHistoryRouter.use(authenticateAccessToken);

chatHistoryRouter.get("/:userId", getChatHistoryHandler);

export default chatHistoryRouter;
