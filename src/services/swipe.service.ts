import { AuthError } from "../errors/AuthError";
import { UserModel } from "../models/User";
import {
  findMutualLike,
  getUserDislikes,
  getUserLikes,
  getUserMatches,
  upsertSwipe,
} from "../repository/swipe.repository";
import {
  validateSwipeAction,
  validateSwipeUserId,
} from "../validation/swipe.validation";
import { validateObjectId } from "../validation/chat.validation";

async function resolveUserSummary(userId: string) {
  const user = await UserModel.findById(userId)
    .select(
      "name phoneNumber email profile active gender interestedIn location",
    )
    .lean();

  if (!user) {
    throw new AuthError("User not found", 404);
  }

  return user;
}

export async function swipeUser(
  swiperId: string,
  targetUserId: string,
  action: string,
) {
  const validatedSwiperId = validateObjectId(swiperId, "swiperId");
  const validatedTargetUserId = validateSwipeUserId(
    targetUserId,
    "targetUserId",
  );
  const validatedAction = validateSwipeAction(action);

  if (validatedSwiperId === validatedTargetUserId) {
    throw new AuthError("You cannot swipe on yourself", 400);
  }

  const targetUser = await UserModel.findById(validatedTargetUserId).lean();
  if (!targetUser) {
    throw new AuthError("Target user not found", 404);
  }

  let matchedAt: Date | undefined;
  if (validatedAction === "like") {
    const reciprocalLike = await findMutualLike(
      validatedSwiperId,
      validatedTargetUserId,
    );
    if (reciprocalLike && reciprocalLike.action === "like") {
      matchedAt = new Date();
      await upsertSwipe({
        swiperId: validatedTargetUserId,
        targetUserId: validatedSwiperId,
        action: "like",
        matchedAt,
      });
    }
  }

  const swipe = await upsertSwipe({
    swiperId: validatedSwiperId,
    targetUserId: validatedTargetUserId,
    action: validatedAction,
    matchedAt,
  });

  return {
    swipe,
    match: Boolean(matchedAt),
  };
}

export async function getLikes(userId: string) {
  const validatedUserId = validateObjectId(userId, "userId");
  const likes = await getUserLikes(validatedUserId);

  const users = await Promise.all(
    likes.map(async (like) => ({
      swipeId: like._id,
      user: await resolveUserSummary(like.targetUserId.toString()),
      createdAt: like.createdAt,
      matchedAt: like.matchedAt,
    })),
  );

  return users;
}

export async function getDislikes(userId: string) {
  const validatedUserId = validateObjectId(userId, "userId");
  const dislikes = await getUserDislikes(validatedUserId);

  return Promise.all(
    dislikes.map(async (dislike) => ({
      swipeId: dislike._id,
      user: await resolveUserSummary(dislike.targetUserId.toString()),
      createdAt: dislike.createdAt,
    })),
  );
}

export async function getMatches(userId: string) {
  const validatedUserId = validateObjectId(userId, "userId");
  const matches = await getUserMatches(validatedUserId);

  return Promise.all(
    matches.map(async (match) => ({
      swipeId: match._id,
      user: await resolveUserSummary(match.targetUserId.toString()),
      matchedAt: match.matchedAt,
      createdAt: match.createdAt,
    })),
  );
}
