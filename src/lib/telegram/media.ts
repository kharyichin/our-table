import { createHash } from "node:crypto";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { downloadTelegramPhoto } from "@/lib/telegram/client";

export const TELEGRAM_MEDIA_BUCKET = "telegram-media";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function persistTelegramPhoto(input: {
  householdId: string;
  chatId: number;
  messageId: number;
  fileId: string;
  reportedSize?: number;
}): Promise<string | null> {
  if (input.reportedSize && input.reportedSize > MAX_IMAGE_BYTES) return null;
  const service = getSupabaseServiceClient();
  if (!service) throw new Error("Supabase service configuration is incomplete.");

  const photo = await downloadTelegramPhoto(input.fileId, MAX_IMAGE_BYTES);
  if (!photo) return null;
  const extension = EXTENSIONS[photo.contentType];
  if (!extension) return null;

  const fileKey = createHash("sha256").update(input.fileId).digest("hex").slice(0, 20);
  const objectPath = `${input.householdId}/${input.chatId}/${input.messageId}/${fileKey}.${extension}`;
  const { error } = await service.storage.from(TELEGRAM_MEDIA_BUCKET).upload(objectPath, photo.bytes, {
    contentType: photo.contentType,
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`Telegram photo upload failed: ${error.message}`);

  return `/api/media/telegram/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
}
