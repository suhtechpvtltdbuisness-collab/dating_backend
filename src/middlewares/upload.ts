import multer from "multer";

/// Kept under Vercel's 4.5MB serverless request body cap so oversized
/// uploads fail with a readable multer error instead of a platform 413.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 9 },
});

/// Accepts the field names the Flutter client uses for single and batch
/// uploads (`file`, `files`, `media`, `photo`, `photos`).
export const uploadAny = upload.any();
