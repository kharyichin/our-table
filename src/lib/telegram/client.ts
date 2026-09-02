const TELEGRAM_API = "https://api.telegram.org";

function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN ?? null;
}

export async function sendTelegramMessage(chatId: number, text: string, replyToMessageId?: number) {
  const token = botToken();
  if (!token) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN not set — skipping sendMessage:", text);
    return;
  }
  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_to_message_id: replyToMessageId,
      link_preview_options: { is_disabled: true },
    }),
  });
  if (!res.ok) {
    console.error("[telegram] sendMessage failed", res.status, await res.text());
  }
}

export async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  const token = botToken();
  if (!token) return null;
  const res = await fetch(`${TELEGRAM_API}/bot${token}/getFile?file_id=${fileId}`);
  if (!res.ok) return null;
  const data = await res.json();
  const filePath = data?.result?.file_path;
  return filePath ? `${TELEGRAM_API}/file/bot${token}/${filePath}` : null;
}

export async function downloadTelegramPhoto(
  fileId: string,
  maxBytes: number
): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  const url = await getTelegramFileUrl(fileId);
  if (!url) return null;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return null;
  const declaredSize = Number(res.headers.get("content-length") ?? 0);
  if (declaredSize > maxBytes) return null;
  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].toLowerCase();
  if (!contentType.startsWith("image/")) return null;
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength > maxBytes) return null;
  return { bytes, contentType };
}
