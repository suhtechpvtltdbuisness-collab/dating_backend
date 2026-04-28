import { AuthError } from "../errors/AuthError";
import { UserModel } from "../models/User";
import {
  type UpdateProfileInput,
  validateUpdateProfileInput,
} from "../validation/profile.validation";

export async function getProfile(userId: string) {
  const profile = await UserModel.findById(userId).lean();
  if (!profile) {
    throw new AuthError("User not found", 404);
  }

  return profile;
}

export async function updateProfile(
  userId: string,
  payload: UpdateProfileInput,
) {
  const updates = validateUpdateProfileInput(payload);

  const profile = await UserModel.findByIdAndUpdate(userId, updates, {
    new: true,
  }).lean();

  if (!profile) {
    throw new AuthError("User not found", 404);
  }

  return profile;
}
