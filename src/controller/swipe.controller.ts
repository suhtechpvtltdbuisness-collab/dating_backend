import type { NextFunction, Request, Response } from "express";
import {
  getDislikes,
  getLikes,
  getMatches,
  swipeUser,
} from "../services/swipe.service";

function getAuthenticatedUserId(res: Response): string {
  const userId = res.locals.user?.sub as string | undefined;
  if (!userId) {
    throw new Error("Missing authenticated user context");
  }
  return userId;
}

export async function rightSwipeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const targetUserId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const result = await swipeUser(userId, targetUserId ?? "", "like");
    res
      .status(200)
      .json({
        message: result.match ? "Match created" : "Liked",
        data: result,
      });
  } catch (error) {
    next(error);
  }
}

export async function leftSwipeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const targetUserId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const result = await swipeUser(userId, targetUserId ?? "", "dislike");
    res.status(200).json({ message: "Disliked", data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMatchesHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const data = await getMatches(userId);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getLikesHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const data = await getLikes(userId);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getDislikesHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(res);
    const data = await getDislikes(userId);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}
