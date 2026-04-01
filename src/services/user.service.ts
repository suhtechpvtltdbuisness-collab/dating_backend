import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { RefreshTokenModel } from "../models/RefreshToken";
import { UserModel } from "../models/User";
import {
  createOtpRecord,
  createUser,
  findUserByEmail,
  findUserByPhone,
  findValidOtp,
} from "../repository/user.repository";
import { AuthError } from "../errors/AuthError";
import { sha256 } from "../utils/hash";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import {
  type LoginInput,
  type RegisterInput,
  validateLoginInput,
  validateOtpInput,
  validateOtpNumber,
  validateRegisterInput,
} from "../validation/user.validation";
import { generateOtp } from "../utils/otp";

function resolveIp(rawIp?: string, fallback?: string): string {
  const candidate = rawIp?.trim() || fallback?.trim() || "0.0.0.0";
  return candidate.split(",")[0].trim();
}

function parseRefreshTtlMs(ttl: string): number {
  const match = ttl.match(/^(\d+)([mhd])$/i);
  if (!match) {
    return 1000 * 60 * 60 * 24 * 30;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
}

async function issueTokens(
  userId: string,
  phoneNumber: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken({ sub: userId, phoneNumber });
  const refreshToken = signRefreshToken({ sub: userId, phoneNumber });

  await RefreshTokenModel.create({
    userId,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + parseRefreshTtlMs(env.refreshTtl)),
  });

  return { accessToken, refreshToken };
}

export async function registerWithEmail(
  payload: RegisterInput,
  requestIp?: string,
) {
  const input = validateRegisterInput(payload);

  const [existingEmail, existingPhone] = await Promise.all([
    findUserByEmail(input.email),
    findUserByPhone(input.phoneNumber),
  ]);

  if (existingEmail) {
    throw new AuthError("Email already exists", 409);
  }

  if (existingPhone) {
    throw new AuthError("Phone number already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await createUser({
    phoneNumber: input.phoneNumber,
    name: input.name,
    dob: new Date(input.dob),
    gender: input.gender,
    interestedIn: input.interestedIn,
    profile: input.profile,
    location: {
      type: "Point",
      coordinates: input.location.coordinates,
    },
    active: input.active ?? true,
    ipAddress: resolveIp(input.ipAddress, requestIp),
    email: input.email,
    password: passwordHash,
  });

  const tokens = await issueTokens(user._id.toString(), user.phoneNumber);

  return {
    userId: user._id.toString(),
    ...tokens,
  };
}

export async function loginWithEmail(payload: LoginInput) {
  const { email, password } = validateLoginInput(payload);

  const user = await findUserByEmail(email);
  if (!user?.password) {
    throw new AuthError("Invalid credentials", 401);
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new AuthError("Invalid credentials", 401);
  }

  return issueTokens(user._id.toString(), user.phoneNumber);
}

export async function generateUserOtp(number: string) {
  const normalizedNumber = validateOtpNumber(number);
  const otp = generateOtp();

  await createOtpRecord(normalizedNumber, otp);
  console.log(`OTP for ${normalizedNumber}: ${otp}`);

  return {
    number: normalizedNumber,
    message: { "Generated OTP": otp },
  };
}

export async function validateUserOtp(number: string, otp?: string) {
  const input = validateOtpInput(number, otp);
  const otpDoc = await findValidOtp(input.number, input.otp);

  if (!otpDoc) {
    throw new AuthError("Invalid or expired OTP", 401);
  }

  otpDoc.consumedAt = new Date();
  await otpDoc.save();

  return { number: input.number, valid: true };
}

export async function getUserProfile(userId: string) {
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new AuthError("User not found", 404);
  }

  return user;
}
