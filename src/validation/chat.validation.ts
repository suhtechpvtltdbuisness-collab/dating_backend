import mongoose from "mongoose";
import { AuthError } from "../errors/AuthError";

export interface CreateChatInput {
  recipientId: string;
  message: string;
}

export interface UpdateChatInput {
  message: string;
}

export function validateObjectId(value: string, fieldName: string): string {
  const candidate = value?.trim();
  if (!candidate || !mongoose.Types.ObjectId.isValid(candidate)) {
    throw new AuthError(`Invalid ${fieldName}`, 400);
  }
  return candidate;
}

export function validateCreateChatInput(
  payload: CreateChatInput,
): CreateChatInput {
  const recipientId = validateObjectId(payload.recipientId, "recipientId");
  const message = payload.message?.trim();

  if (!message) {
    throw new AuthError("message is required", 400);
  }

  return { recipientId, message };
}

export function validateUpdateChatInput(
  payload: UpdateChatInput,
): UpdateChatInput {
  const message = payload.message?.trim();
  if (!message) {
    throw new AuthError("message is required", 400);
  }

  return { message };
}
