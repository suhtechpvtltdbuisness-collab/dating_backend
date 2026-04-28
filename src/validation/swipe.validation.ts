import mongoose from "mongoose";
import { AuthError } from "../errors/AuthError";

export type SwipeAction = "like" | "dislike";

export function validateSwipeUserId(userId: string, fieldName: string): string {
  const candidate = userId?.trim();
  if (!candidate || !mongoose.Types.ObjectId.isValid(candidate)) {
    throw new AuthError(`Invalid ${fieldName}`, 400);
  }
  return candidate;
}

export function validateSwipeAction(action: string): SwipeAction {
  if (action !== "like" && action !== "dislike") {
    throw new AuthError("Invalid swipe action", 400);
  }
  return action;
}
