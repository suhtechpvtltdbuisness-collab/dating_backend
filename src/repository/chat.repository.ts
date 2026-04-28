import { Types } from "mongoose";
import { ChatModel } from "../models/Chat";

export function createChatMessage(input: {
  senderId: string;
  recipientId: string;
  message: string;
}) {
  return ChatModel.create(input);
}

export function findChatById(chatId: string) {
  return ChatModel.findById(chatId);
}

export function updateChatById(chatId: string, message: string) {
  return ChatModel.findByIdAndUpdate(
    chatId,
    { message, editedAt: new Date() },
    { new: true },
  );
}

export function softDeleteChatById(chatId: string) {
  return ChatModel.findByIdAndUpdate(
    chatId,
    { deletedAt: new Date() },
    { new: true },
  );
}

export function getConversationHistory(userA: string, userB: string) {
  return ChatModel.find({
    deletedAt: { $exists: false },
    $or: [
      { senderId: userA, recipientId: userB },
      { senderId: userB, recipientId: userA },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();
}

export function getChatsByRecipientId(recipientId: string) {
  return ChatModel.find({
    deletedAt: { $exists: false },
    recipientId,
  })
    .sort({ createdAt: -1 })
    .lean();
}

export function getChatUsers(userId: string) {
  const userObjectId = new Types.ObjectId(userId);

  return ChatModel.aggregate([
    {
      $match: {
        deletedAt: { $exists: false },
        $or: [{ senderId: userObjectId }, { recipientId: userObjectId }],
      },
    },
    {
      $project: {
        chatPartner: {
          $cond: [
            { $eq: ["$senderId", userObjectId] },
            "$recipientId",
            "$senderId",
          ],
        },
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$chatPartner",
        lastMessageAt: { $first: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        name: "$user.name",
        phoneNumber: "$user.phoneNumber",
        email: "$user.email",
        lastMessageAt: 1,
      },
    },
    { $sort: { lastMessageAt: -1 } },
  ]);
}
