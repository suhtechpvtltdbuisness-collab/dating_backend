import { AuthError } from "../errors/AuthError";

const ALLOWED_PROFILE_FIELDS = [
  "name",
  "gender",
  "interestedIn",
  "profile",
  "active",
] as const;

type AllowedProfileField = (typeof ALLOWED_PROFILE_FIELDS)[number];

export type UpdateProfileInput = Partial<
  Record<AllowedProfileField, string | boolean>
>;

export function validateUpdateProfileInput(
  payload: UpdateProfileInput,
): UpdateProfileInput {
  const updates: UpdateProfileInput = {};

  for (const field of ALLOWED_PROFILE_FIELDS) {
    const value = payload[field];
    if (value === undefined) {
      continue;
    }

    if (field === "active") {
      if (typeof value !== "boolean") {
        throw new AuthError("active must be a boolean", 400);
      }
      updates[field] = value;
      continue;
    }

    if (typeof value !== "string" || !value.trim()) {
      throw new AuthError(`${field} must be a non-empty string`, 400);
    }

    updates[field] = value.trim();
  }

  if (Object.keys(updates).length === 0) {
    throw new AuthError(
      `At least one field is required: ${ALLOWED_PROFILE_FIELDS.join(", ")}`,
      400,
    );
  }

  return updates;
}
