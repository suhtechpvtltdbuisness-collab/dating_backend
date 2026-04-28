import { Schema, model, type InferSchemaType, Types } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["chat", "system", "match", "profile"],
      default: "system",
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    metadata: { type: Schema.Types.Mixed },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<
  typeof notificationSchema
> & {
  _id: Types.ObjectId;
};

export const NotificationModel = model("Notification", notificationSchema);
