import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

interface TokenPayload {
  sub: string;
  phoneNumber: string;
}

function signToken(
  payload: TokenPayload,
  secret: Secret,
  expiresIn: string,
): string {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
}

export function signAccessToken(payload: TokenPayload): string {
  return signToken(payload, env.accessSecret, env.accessTtl);
}

export function signRefreshToken(payload: TokenPayload): string {
  return signToken(payload, env.refreshSecret, env.refreshTtl);
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.refreshSecret) as TokenPayload;
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.accessSecret) as TokenPayload;
}

export type { TokenPayload };
