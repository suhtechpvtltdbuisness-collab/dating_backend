import { Types } from "mongoose";
import { AuthError } from "../errors/AuthError";
import { ChatModel } from "../models/Chat";
import { ConversationModel } from "../models/Conversation";
import { ReportModel } from "../models/Report";
import { UserModel } from "../models/User";
import { presentConversation, presentMessage } from "../presenters";
import { validateObjectId } from "../validation/chat.validation";

const DEFAULT_MESSAGE_LIMIT = 50;

function clamp(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function otherParticipantId(
  conversation: { participants: unknown[] },
  userId: string,
): string {
  const other = conversation.participants.find(
    (participant) => String(participant) !== userId,
  );
  return String(other ?? "");
}

async function requireConversation(userId: string, chatId: string) {
  const conversation = await ConversationModel.findOne({
    _id: validateObjectId(chatId, "chatId"),
    participants: userId,
  });

  if (!conversation) {
    throw new AuthError("Chat not found", 404);
  }

  return conversation;
}

async function loadMessages(
  conversationId: Types.ObjectId,
  page: number,
  limit: number,
) {
  const messages = await ChatModel.find({
    conversationId,
    deletedAt: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const senderIds = [...new Set(messages.map((item) => String(item.senderId)))];
  const senders = await UserModel.find({ _id: { $in: senderIds } })
    .select("name photos")
    .lean();
  const senderById = new Map(senders.map((user) => [String(user._id), user]));

  return messages
    .reverse()
    .map((message) =>
      presentMessage(message, senderById.get(String(message.senderId))),
    );
}

export async function listConversations(
  userId: string,
  page = 1,
  limit = 20,
) {
  const validUserId = validateObjectId(userId, "userId");
  const safeLimit = clamp(limit, 20, 100);
  const safePage = clamp(page, 1, 1000);

  const conversations = await ConversationModel.find({
    participants: validUserId,
    deletedFor: { $ne: new Types.ObjectId(validUserId) },
  })
    .sort({ lastMessageAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  const otherIds = conversations.map((conversation) =>
    otherParticipantId(conversation, validUserId),
  );
  const users = await UserModel.find({ _id: { $in: otherIds } })
    .select("name photos isOnline lastActive")
    .lean();
  const userById = new Map(users.map((user) => [String(user._id), user]));

  return conversations.map((conversation) =>
    presentConversation(
      conversation,
      validUserId,
      userById.get(otherParticipantId(conversation, validUserId)),
    ),
  );
}

export async function createConversation(
  userId: string,
  payload: { recipientId?: string; message?: string },
) {
  const validUserId = validateObjectId(userId, "userId");
  const recipientId = validateObjectId(payload?.recipientId ?? "", "recipientId");

  if (recipientId === validUserId) {
    throw new AuthError("You cannot start a chat with yourself", 400);
  }

  const recipient = await UserModel.findById(recipientId)
    .select("name photos isOnline lastActive blockedUsers")
    .lean();
  if (!recipient) {
    throw new AuthError("Recipient not found", 404);
  }

  if ((recipient.blockedUsers ?? []).some((id) => String(id) === validUserId)) {
    throw new AuthError("You cannot message this user", 403);
  }

  const existing = await ConversationModel.findOne({
    participants: { $all: [validUserId, recipientId], $size: 2 },
  });

  const conversation =
    existing ??
    (await ConversationModel.create({
      participants: [validUserId, recipientId],
      lastMessage: "",
      lastMessageAt: new Date(),
    }));

  if (existing) {
    await ConversationModel.updateOne(
      { _id: conversation._id },
      { $pull: { deletedFor: new Types.ObjectId(validUserId) } },
    );
  }

  const message = payload?.message?.trim();
  if (message) {
    await appendMessage(conversation, validUserId, recipientId, { message });
  }

  const refreshed = await ConversationModel.findById(conversation._id).lean();

  return presentConversation(
    refreshed ?? conversation.toObject(),
    validUserId,
    recipient,
    await loadMessages(conversation._id, 1, DEFAULT_MESSAGE_LIMIT),
  );
}

async function appendMessage(
  conversation: { _id: Types.ObjectId; unread?: unknown },
  senderId: string,
  recipientId: string,
  payload: {
    message: string;
    attachmentUrl?: string;
    attachmentType?: string;
  },
) {
  const chat = await ChatModel.create({
    conversationId: conversation._id,
    senderId,
    recipientId,
    message: payload.message,
    attachmentUrl: payload.attachmentUrl,
    attachmentType: payload.attachmentType,
  });

  await ConversationModel.updateOne(
    { _id: conversation._id },
    {
      $set: {
        lastMessage: payload.message,
        lastMessageAt: chat.createdAt,
      },
      $inc: { [`unread.${recipientId}`]: 1 },
      $pull: { deletedFor: new Types.ObjectId(recipientId) },
    },
  );

  return chat;
}

export async function getConversation(
  userId: string,
  chatId: string,
  page = 1,
  limit = DEFAULT_MESSAGE_LIMIT,
) {
  const validUserId = validateObjectId(userId, "userId");
  const conversation = await requireConversation(validUserId, chatId);
  const otherId = otherParticipantId(conversation, validUserId);

  const [otherUser, messages] = await Promise.all([
    UserModel.findById(otherId).select("name photos isOnline lastActive").lean(),
    loadMessages(
      conversation._id,
      clamp(page, 1, 1000),
      clamp(limit, DEFAULT_MESSAGE_LIMIT, 200),
    ),
  ]);

  return presentConversation(
    conversation.toObject(),
    validUserId,
    otherUser,
    messages,
  );
}

export async function listConversationMessages(
  userId: string,
  chatId: string,
  page = 1,
  limit = DEFAULT_MESSAGE_LIMIT,
) {
  const validUserId = validateObjectId(userId, "userId");
  const conversation = await requireConversation(validUserId, chatId);

  return loadMessages(
    conversation._id,
    clamp(page, 1, 1000),
    clamp(limit, DEFAULT_MESSAGE_LIMIT, 200),
  );
}

export async function sendConversationMessage(
  userId: string,
  chatId: string,
  payload: {
    message?: string;
    attachmentUrl?: string;
    attachmentType?: string;
  },
) {
  const validUserId = validateObjectId(userId, "userId");
  const conversation = await requireConversation(validUserId, chatId);

  const message = payload?.message?.trim();
  if (!message) {
    throw new AuthError("message is required", 400);
  }

  if ((conversation.blockedBy ?? []).length > 0) {
    throw new AuthError("This conversation is blocked", 403);
  }

  const recipientId = otherParticipantId(conversation, validUserId);
  const chat = await appendMessage(conversation, validUserId, recipientId, {
    message,
    attachmentUrl: payload.attachmentUrl,
    attachmentType: payload.attachmentType,
  });

  const sender = await UserModel.findById(validUserId)
    .select("name photos")
    .lean();

  return presentMessage(chat.toObject(), sender);
}

export async function markConversationRead(userId: string, chatId: string) {
  const validUserId = validateObjectId(userId, "userId");
  const conversation = await requireConversation(validUserId, chatId);

  await Promise.all([
    ChatModel.updateMany(
      {
        conversationId: conversation._id,
        recipientId: validUserId,
        readAt: { $exists: false },
      },
      { readAt: new Date() },
    ),
    ConversationModel.updateOne(
      { _id: conversation._id },
      { $set: { [`unread.${validUserId}`]: 0 } },
    ),
  ]);

  return { chatId: String(conversation._id), unreadCount: 0 };
}

export async function updateConversation(
  userId: string,
  chatId: string,
  payload: { isBlocked?: boolean },
) {
  const validUserId = validateObjectId(userId, "userId");
  const conversation = await requireConversation(validUserId, chatId);

  if (typeof payload?.isBlocked === "boolean") {
    await ConversationModel.updateOne(
      { _id: conversation._id },
      payload.isBlocked
        ? { $addToSet: { blockedBy: new Types.ObjectId(validUserId) } }
        : { $pull: { blockedBy: new Types.ObjectId(validUserId) } },
    );
  }

  return getConversation(validUserId, chatId);
}

export async function deleteConversation(userId: string, chatId: string) {
  const validUserId = validateObjectId(userId, "userId");
  const conversation = await requireConversation(validUserId, chatId);

  await ConversationModel.updateOne(
    { _id: conversation._id },
    { $addToSet: { deletedFor: new Types.ObjectId(validUserId) } },
  );

  return { deleted: true, chatId: String(conversation._id) };
}

export async function deleteConversationMessage(
  userId: string,
  chatId: string,
  messageId: string,
) {
  const validUserId = validateObjectId(userId, "userId");
  const conversation = await requireConversation(validUserId, chatId);

  const message = await ChatModel.findOneAndUpdate(
    {
      _id: validateObjectId(messageId, "messageId"),
      conversationId: conversation._id,
      senderId: validUserId,
      deletedAt: { $exists: false },
    },
    { deletedAt: new Date() },
    { new: true },
  );

  if (!message) {
    throw new AuthError("Message not found", 404);
  }

  return { deleted: true, messageId: String(message._id) };
}

export async function attachConversationMedia(
  userId: string,
  chatId: string,
  mediaUrl: string,
) {
  const validUserId = validateObjectId(userId, "userId");
  await requireConversation(validUserId, chatId);
  return { mediaUrl };
}

export async function reportConversationMessage(
  userId: string,
  payload: { messageId?: string; reason?: string; details?: string },
) {
  const validUserId = validateObjectId(userId, "userId");
  const reason = payload?.reason?.trim();
  if (!reason) {
    throw new AuthError("reason is required", 400);
  }

  const messageId = payload?.messageId
    ? validateObjectId(payload.messageId, "messageId")
    : undefined;

  const message = messageId ? await ChatModel.findById(messageId).lean() : null;

  const report = await ReportModel.create({
    reporterId: validUserId,
    messageId,
    reportedUserId: message?.senderId,
    reason,
    details: payload?.details,
  });

  return { reported: true, reportId: String(report._id) };
}

/// Conversations with a specific counterpart — backs
/// `GET /chats/recipient/:recipientId` and `GET /chat-history/:userId`.
export async function getConversationsWith(
  userId: string,
  otherUserId: string,
  withMessages = false,
) {
  const validUserId = validateObjectId(userId, "userId");
  const validOtherId = validateObjectId(otherUserId, "userId");

  const conversation = await ConversationModel.findOne({
    participants: { $all: [validUserId, validOtherId], $size: 2 },
  }).lean();

  if (!conversation) {
    return [];
  }

  const otherUser = await UserModel.findById(validOtherId)
    .select("name photos isOnline lastActive")
    .lean();

  return [
    presentConversation(
      conversation,
      validUserId,
      otherUser,
      withMessages
        ? await loadMessages(conversation._id, 1, DEFAULT_MESSAGE_LIMIT)
        : [],
    ),
  ];
}
