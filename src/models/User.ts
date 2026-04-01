import { Schema, model, type InferSchemaType } from "mongoose";

const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      validate: {
        validator: (value: string) => E164_PHONE_REGEX.test(value),
        message:
          "Invalid phoneNumber format. Use E.164 format, e.g. +919999999999",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string) => EMAIL_REGEX.test(value),
        message: "Invalid email format",
      },
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true, trim: true },
    interestedIn: { type: String, required: true, trim: true },
    profile: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value: number[]) => value.length === 2,
          message: "Location coordinates must be [longitude, latitude]",
        },
      },
    },
    active: { type: Boolean, default: true },
    ipAddress: { type: String, required: true },
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };

export const UserModel = model("User", userSchema);
