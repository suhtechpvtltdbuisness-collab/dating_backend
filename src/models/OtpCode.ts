import { Schema, model } from "mongoose";

const otpCodeSchema = new Schema(
  {
    phoneNumber: { type: String, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    purpose: {
      type: String,
      enum: ["register", "login"],
      required: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: true },
);

otpCodeSchema.path("phoneNumber").validate(function (value: unknown) {
  const hasPhone = typeof value === "string" && value.trim().length > 0;
  const hasEmail =
    typeof this.get("email") === "string" &&
    (this.get("email") as string).trim().length > 0;
  return hasPhone || hasEmail;
}, "Either phoneNumber or email is required");

otpCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 30 });

export const OtpCodeModel = model("OtpCode", otpCodeSchema);
