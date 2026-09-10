import type { NextFunction, Request, Response } from "express";
import {
  acceptMatch,
  getMatchDetail,
  getMatches,
  getTopMatches,
  rejectMatch,
  unmatch,
} from "../services/swipe.service";
import { numericQuery, param, requireUserId } from "../utils/context";

export async function listMatchesHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUserId(res);
    const data = await getMatches(userId);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function topMatchesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUserId(res);
    const data = await getTopMatches(userId, numericQuery(req, "limit") ?? 10);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function matchDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUserId(res);
    const data = await getMatchDetail(userId, param(req, "id"));
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function acceptMatchHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUserId(res);
    const data = await acceptMatch(userId, param(req, "id"));
    res.status(200).json({ message: "Match accepted", data });
  } catch (error) {
    next(error);
  }
}

export async function rejectMatchHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUserId(res);
    const data = await rejectMatch(userId, param(req, "id"));
    res.status(200).json({ message: "Match rejected", data });
  } catch (error) {
    next(error);
  }
}

export async function unmatchHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUserId(res);
    const data = await unmatch(userId, param(req, "id"));
    res.status(200).json({ message: "Unmatched", data });
  } catch (error) {
    next(error);
  }
}
