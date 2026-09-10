import type { Request } from "express";
import { AuthError } from "../errors/AuthError";
import { MediaModel } from "../models/Media";
import { validateObjectId } from "../validation/chat.validation";

function baseUrlOf(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0]
      : req.protocol;
  return `${protocol}://${req.get("host")}`;
}

export async function storeUploads(
  req: Request,
  ownerId: string,
): Promise<string[]> {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) {
    throw new AuthError("No file uploaded", 400);
  }

  const created = await MediaModel.insertMany(
    files.map((file) => ({
      ownerId,
      contentType: file.mimetype,
      size: file.size,
      data: file.buffer,
    })),
  );

  return created.map((media) => `${baseUrlOf(req)}/media/${media._id}`);
}

export async function readMedia(mediaId: string) {
  const media = await MediaModel.findById(
    validateObjectId(mediaId, "mediaId"),
  ).lean();
  if (!media) {
    throw new AuthError("Media not found", 404);
  }
  return media;
}
