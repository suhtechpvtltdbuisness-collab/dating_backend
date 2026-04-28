import { Router } from "express";
import { authenticateAccessToken } from "../middlewares/authenticate";
import {
  createChatHandler,
  deleteChatHandler,
  getChatHandler,
  getChatsByRecipientHandler,
  updateChatHandler,
} from "../controller/chat.controller";

const chatRouter = Router();

chatRouter.use(authenticateAccessToken);

chatRouter.post("/", createChatHandler);
chatRouter.get("/recipient/:recipientId", getChatsByRecipientHandler);
chatRouter.get("/:chatId", getChatHandler);
chatRouter.put("/:chatId", updateChatHandler);
chatRouter.delete("/:chatId", deleteChatHandler);

export default chatRouter;
