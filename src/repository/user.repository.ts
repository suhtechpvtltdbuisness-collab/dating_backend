import { OtpCodeModel } from "../models/OtpCode";
import { RefreshTokenModel } from "../models/RefreshToken";
import { UserModel } from "../models/User";
import { sha256 } from "../utils/hash";

export interface CreateUserInput {
  phoneNumber: string;
  name: string;
  dob: Date;
  gender: string;
  interestedIn: string;
  profile: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  active: boolean;
  ipAddress: string;
  email: string;
  password: string;
}

export function findUserByEmail(email: string) {
  return UserModel.findOne({ email: email.toLowerCase() }).select("+password");
}

export function findUserByPhone(phoneNumber: string) {
  return UserModel.findOne({ phoneNumber });
}

export function createUser(input: CreateUserInput) {
  return UserModel.create(input);
}

export function createOtpRecord(phoneNumber: string, otp: string) {
  return OtpCodeModel.create({
    phoneNumber,
    purpose: "login",
    codeHash: sha256(otp),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
}

export function findValidOtp(phoneNumber: string, otp: string) {
  return OtpCodeModel.findOne({
    phoneNumber,
    purpose: "login",
    codeHash: sha256(otp),
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
}

export function revokeRefreshToken(refreshToken: string) {
  return RefreshTokenModel.updateOne(
    { tokenHash: sha256(refreshToken) },
    { revokedAt: new Date() },
  );
}
