import { Schema, model, type InferSchemaType, Types } from "mongoose";

const chatSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    editedAt: { type: Date },
    deletedAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true },
);

chatSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });

export type ChatDocument = InferSchemaType<typeof chatSchema> & {
  _id: Types.ObjectId;
};

export const ChatModel = model("Chat", chatSchema);
