import type { NextFunction, Request, Response } from "express";
import { getProfile, updateProfile } from "../services/profile.service";

function getAuthenticatedUserId(res: Response): string {
  const userId = res.locals.user?.sub as string | undefined;
  if (!userId) {
    throw new Error("Missing authenticated user context");
  }
  return userId;
}

export async function getProfileHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const profile = await getProfile(userId);
    res.status(200).json({ data: profile });
  } catch (error) {
    next(error);
  }
}

export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const profile = await updateProfile(userId, req.body);
    res.status(200).json({ message: "Profile updated", data: profile });
  } catch (error) {
    next(error);
  }
}
