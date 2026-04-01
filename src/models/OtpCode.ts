import { Schema, model } from "mongoose";

const otpCodeSchema = new Schema(
  {
    phoneNumber: { type: String, required: true, index: true },
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

otpCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 30 });

export const OtpCodeModel = model("OtpCode", otpCodeSchema);
