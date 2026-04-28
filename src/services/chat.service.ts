import { Types } from "mongoose";
import { AuthError } from "../errors/AuthError";
import {
  createChatMessage,
  getChatsByRecipientId,
  findChatById,
  getChatUsers,
  getConversationHistory,
  softDeleteChatById,
  updateChatById,
} from "../repository/chat.repository";
import {
  type CreateChatInput,
  type UpdateChatInput,
  validateCreateChatInput,
  validateObjectId,
  validateUpdateChatInput,
} from "../validation/chat.validation";

export async function createChat(userId: string, payload: CreateChatInput) {
  const input = validateCreateChatInput(payload);
  if (input.recipientId === userId) {
    throw new AuthError("You cannot send a message to yourself", 400);
  }

  const chat = await createChatMessage({
    senderId: userId,
    recipientId: input.recipientId,
    message: input.message,
  });

  return chat;
}

export async function getChat(chatId: string, userId: string) {
  const validatedChatId = validateObjectId(chatId, "chatId");
  const chat = await findChatById(validatedChatId);
  if (!chat || chat.deletedAt) {
    throw new AuthError("Chat not found", 404);
  }

  const senderId = chat.senderId.toString();
  const recipientId = chat.recipientId.toString();
  if (senderId !== userId && recipientId !== userId) {
    throw new AuthError("You are not allowed to view this chat", 403);
  }

  return chat;
}

export async function updateChat(
  chatId: string,
  userId: string,
  payload: UpdateChatInput,
) {
  const validatedChatId = validateObjectId(chatId, "chatId");
  const input = validateUpdateChatInput(payload);

  const existing = await findChatById(validatedChatId);
  if (!existing || existing.deletedAt) {
    throw new AuthError("Chat not found", 404);
  }

  if (existing.senderId.toString() !== userId) {
    throw new AuthError("Only the sender can update a chat", 403);
  }

  const updated = await updateChatById(validatedChatId, input.message);
  if (!updated) {
    throw new AuthError("Unable to update chat", 500);
  }

  return updated;
}

export async function deleteChat(chatId: string, userId: string) {
  const validatedChatId = validateObjectId(chatId, "chatId");

  const existing = await findChatById(validatedChatId);
  if (!existing || existing.deletedAt) {
    throw new AuthError("Chat not found", 404);
  }

  if (existing.senderId.toString() !== userId) {
    throw new AuthError("Only the sender can delete a chat", 403);
  }

  const deleted = await softDeleteChatById(validatedChatId);
  if (!deleted) {
    throw new AuthError("Unable to delete chat", 500);
  }

  return { deleted: true, chatId: validatedChatId };
}

export async function getUserChatUsers(userId: string) {
  return getChatUsers(validateObjectId(userId, "userId"));
}

export async function getChatHistory(
  currentUserId: string,
  otherUserId: string,
) {
  const validatedCurrentUserId = validateObjectId(
    currentUserId,
    "currentUserId",
  );
  const validatedOtherUserId = validateObjectId(otherUserId, "userId");

  return getConversationHistory(validatedCurrentUserId, validatedOtherUserId);
}

export async function getChatsByRecipient(userId: string, recipientId: string) {
  const validatedCurrentUserId = validateObjectId(userId, "userId");
  const validatedRecipientId = validateObjectId(recipientId, "recipientId");

  return getConversationHistory(validatedCurrentUserId, validatedRecipientId);
}
