import type { NextFunction, Request, Response } from "express";
import {
  createChat,
  deleteChat,
  getChat,
  getChatHistory,
  getChatsByRecipient,
  getUserChatUsers,
  updateChat,
} from "../services/chat.service";

function getAuthenticatedUserId(res: Response): string {
  const userId = res.locals.user?.sub as string | undefined;
  if (!userId) {
    throw new Error("Missing authenticated user context");
  }
  return userId;
}

export async function createChatHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const chat = await createChat(userId, req.body);
    res.status(201).json({ message: "Chat created", data: chat });
  } catch (error) {
    next(error);
  }
}

export async function getChatHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const chatId = Array.isArray(req.params.chatId)
      ? req.params.chatId[0]
      : req.params.chatId;
    const chat = await getChat(chatId ?? "", userId);
    res.status(200).json({ data: chat });
  } catch (error) {
    next(error);
  }
}

export async function updateChatHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const chatId = Array.isArray(req.params.chatId)
      ? req.params.chatId[0]
      : req.params.chatId;
    const chat = await updateChat(chatId ?? "", userId, req.body);
    res.status(200).json({ message: "Chat updated", data: chat });
  } catch (error) {
    next(error);
  }
}

export async function deleteChatHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const chatId = Array.isArray(req.params.chatId)
      ? req.params.chatId[0]
      : req.params.chatId;
    const result = await deleteChat(chatId ?? "", userId);
    res.status(200).json({ message: "Chat deleted", data: result });
  } catch (error) {
    next(error);
  }
}

export async function getChatUsersHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const users = await getUserChatUsers(userId);
    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
}

export async function getChatsByRecipientHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const recipientId = Array.isArray(req.params.recipientId)
      ? req.params.recipientId[0]
      : req.params.recipientId;
    const chats = await getChatsByRecipient(userId, recipientId ?? "");
    res.status(200).json({ data: chats });
  } catch (error) {
    next(error);
  }
}

export async function getChatHistoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const targetUserId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const history = await getChatHistory(userId, targetUserId ?? "");
    res.status(200).json({ data: history });
  } catch (error) {
    next(error);
  }
}
