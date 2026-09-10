const LOOKING_FOR = ["dating", "relationship", "friendship", "networking"];
const GENDERS = ["male", "female", "other"];

const FEMALE_LABELS = ["female", "women", "woman", "f", "girl"];
const MALE_LABELS = ["male", "men", "man", "m", "boy"];

export function normalizeGender(value: unknown): string {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  if (FEMALE_LABELS.includes(v)) return "female";
  if (MALE_LABELS.includes(v)) return "male";
  return "other";
}

function toId(value: unknown): string {
  return value == null ? "" : String(value);
}

function firstPhoto(user: any): string {
  return Array.isArray(user?.photos) && user.photos.length > 0
    ? user.photos[0]
    : "";
}

export function presentUser(user: any) {
  if (!user) return null;
  return {
    id: toId(user._id),
    _id: toId(user._id),
    email: user.email ?? "",
    name: user.name ?? "",
    phoneNumber: user.phoneNumber,
    dob: user.dob,
    dateOfBirth: user.dob,
    gender: normalizeGender(user.gender),
    interestedIn: user.interestedIn ?? "",
    profile: user.profile ?? "",
    photos: user.photos ?? [],
    photoUrls: user.photos ?? [],
    bio: user.bio ?? user.profile ?? "",
    interests: user.interests ?? [],
    city: user.city,
    country: user.country,
    relationshipStatus: user.relationshipStatus ?? "single",
    location: user.location,
    isVerified: Boolean(user.isVerified),
    isOnline: Boolean(user.isOnline),
    lastActive: user.lastActive ?? user.updatedAt,
    createdAt: user.createdAt,
    active: user.active !== false,
  };
}

export function presentPreferences(user: any) {
  const prefs = user?.preferences ?? {};
  const lookingFor = (prefs.lookingFor ?? []).filter((item: string) =>
    LOOKING_FOR.includes(item),
  );
  const preferredGenders = (prefs.preferredGenders ?? [])
    .map(normalizeGender)
    .filter((item: string) => GENDERS.includes(item));

  return {
    id: toId(user?._id),
    userId: toId(user?._id),
    minAge: prefs.minAge ?? 18,
    maxAge: prefs.maxAge ?? 70,
    maxDistance: prefs.maxDistance ?? 50,
    lookingFor: lookingFor.length ? lookingFor : ["dating"],
    interests: prefs.interests ?? [],
    preferredGenders: preferredGenders.length
      ? preferredGenders
      : [normalizeGender(user?.interestedIn)],
    locationEnabled: prefs.locationEnabled !== false,
    showOnline: prefs.showOnline !== false,
    notificationsEnabled: prefs.notificationsEnabled !== false,
    lastUpdated: prefs.lastUpdated ?? new Date(),
  };
}

export function presentMessage(chat: any, sender?: any) {
  return {
    id: toId(chat._id),
    conversationId: toId(chat.conversationId),
    senderId: toId(chat.senderId),
    senderName: sender?.name ?? "",
    senderImage: firstPhoto(sender),
    message: chat.message ?? "",
    timestamp: chat.createdAt,
    status: chat.readAt ? "read" : "sent",
    isRead: Boolean(chat.readAt),
    attachmentUrl: chat.attachmentUrl ?? null,
    attachmentType: chat.attachmentType ?? null,
  };
}

export function presentConversation(
  conversation: any,
  currentUserId: string,
  otherUser: any,
  messages: any[] = [],
) {
  const unread = conversation.unread;
  const unreadCount =
    unread instanceof Map
      ? (unread.get(currentUserId) ?? 0)
      : (unread?.[currentUserId] ?? 0);

  return {
    id: toId(conversation._id),
    userId: currentUserId,
    otherUserId: toId(otherUser?._id),
    otherUserName: otherUser?.name ?? "",
    otherUserImage: firstPhoto(otherUser),
    lastMessage: conversation.lastMessage ?? "",
    lastMessageTime: conversation.lastMessageAt ?? conversation.updatedAt,
    unreadCount,
    isOnline: Boolean(otherUser?.isOnline),
    lastSeenTime: otherUser?.lastActive ?? null,
    messages,
    isBlocked: (conversation.blockedBy ?? []).some(
      (id: unknown) => toId(id) === currentUserId,
    ),
  };
}

export function presentMatch(swipe: any, currentUserId: string, user: any) {
  return {
    id: toId(swipe._id),
    userId: currentUserId,
    targetUserId: toId(swipe.targetUserId),
    status: swipe.matchedAt ? "accepted" : "pending",
    createdAt: swipe.createdAt,
    acceptedAt: swipe.matchedAt ?? null,
    isNew: Boolean(swipe.matchedAt),
    likeCount: 1,
    superLikeCount: 0,
    matchedUser: presentUser(user),
  };
}
