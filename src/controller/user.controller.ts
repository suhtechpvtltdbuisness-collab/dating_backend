import type { NextFunction, Request, Response } from "express";
import {
  generateUserOtp,
  getUserProfile,
  loginWithEmail,
  registerWithEmail,
  validateUserOtp,
} from "../services/user.service";

export async function registerUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await registerWithEmail(req.body, req.ip);
    res.status(201).json({ message: "User registered", data: result });
  } catch (error) {
    next(error);
  }
}

export async function loginUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await loginWithEmail(req.body);
    res.status(200).json({ message: "Login successful", data: result });
  } catch (error) {
    next(error);
  }
}

export async function generateOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const number = Array.isArray(req.params.number)
      ? req.params.number[0]
      : req.params.number;
    const result = await generateUserOtp(number ?? "");
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function validateOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { number, otp } = req.body as { number?: string; otp?: string };
    const result = await validateUserOtp(number ?? "", otp);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMeHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = res.locals.user?.sub as string | undefined;
    if (!userId) {
      throw new Error("Missing authenticated user context");
    }

    const user = await getUserProfile(userId);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}
