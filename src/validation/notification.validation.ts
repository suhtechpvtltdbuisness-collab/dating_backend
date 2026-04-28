import { AuthError } from "../errors/AuthError";

const ALLOWED_NOTIFICATION_TYPES = ["chat", "system", "match", "profile"];

export interface CreateNotificationInput {
  type: string;
  title: string;
  body: string;
  metadata?: unknown;
}

export function validateCreateNotificationInput(
  payload: CreateNotificationInput,
): CreateNotificationInput {
  const type = payload.type?.trim();
  const title = payload.title?.trim();
  const body = payload.body?.trim();

  if (!type || !ALLOWED_NOTIFICATION_TYPES.includes(type)) {
    throw new AuthError(
      `type must be one of: ${ALLOWED_NOTIFICATION_TYPES.join(", ")}`,
      400,
    );
  }

  if (!title) {
    throw new AuthError("title is required", 400);
  }

  if (!body) {
    throw new AuthError("body is required", 400);
  }

  return { ...payload, type, title, body };
}
