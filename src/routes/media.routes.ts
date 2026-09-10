import { Router } from "express";
import { readMedia } from "../services/media.service";

const mediaRouter = Router();

mediaRouter.get("/:mediaId", async (req, res, next) => {
  try {
    const media = await readMedia(req.params.mediaId ?? "");
    // `lean()` hands back the driver's Binary wrapper rather than a Buffer.
    const bytes = Buffer.isBuffer(media.data)
      ? media.data
      : Buffer.from((media.data as { buffer: Uint8Array }).buffer);

    res.setHeader("Content-Type", media.contentType);
    res.setHeader("Content-Length", String(bytes.length));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.end(bytes);
  } catch (error) {
    next(error);
  }
});

export default mediaRouter;
