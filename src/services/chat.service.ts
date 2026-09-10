import { getChatUsers } from "../repository/chat.repository";
import { validateObjectId } from "../validation/chat.validation";

export async function getUserChatUsers(userId: string) {
  return getChatUsers(validateObjectId(userId, "userId"));
}
