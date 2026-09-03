import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_HTML_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8_000;

export interface ImportedRecipe {
  title: string | null;
  description: string | null;
  servings: string | null;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string | null;
}

type JsonObject = Record<string, unknown>;

export function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  let decoded = value;
  // Some publishers double-encode entities (for example &amp;#32;). A few
  // bounded passes handle those safely without risking an unending loop.
  for (let pass = 0; pass < 3; pass++) {
    const next = decoded.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
      if (code[0] !== "#") return named[code.toLowerCase()] ?? entity;
      const numeric = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : entity;
    });
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
}

function objectsIn(value: unknown): JsonObject[] {
  if (Array.isArray(value)) return value.flatMap(objectsIn);
  if (!value || typeof value !== "object") return [];
  const object = value as JsonObject;
  return [object, ...objectsIn(object["@graph"]), ...objectsIn(object.mainEntity)];
}

function isRecipeNode(node: JsonObject): boolean {
  const type = node["@type"];
  return (Array.isArray(type) ? type : [type]).some((item) => String(item).toLowerCase() === "recipe");
}

function imageUrl(value: unknown): string | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  const raw = typeof candidate === "string" ? candidate : candidate && typeof candidate === "object" ? (candidate as JsonObject).url : null;
  if (typeof raw !== "string") return null;
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function instructionLines(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [decodeHtmlEntities(value.trim())] : [];
  if (Array.isArray(value)) return value.flatMap(instructionLines);
  if (!value || typeof value !== "object") return [];
  const item = value as JsonObject;
  if (item.itemListElement) return instructionLines(item.itemListElement);
  const text = typeof item.text === "string" ? item.text : typeof item.name === "string" ? item.name : "";
  return text.trim() ? [decodeHtmlEntities(text.trim())] : [];
}

export function extractRecipeFromHtml(html: string): ImportedRecipe | null {
  const scripts = html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const node = objectsIn(parsed).find(isRecipeNode);
      if (!node) continue;
      const ingredients = Array.isArray(node.recipeIngredient)
        ? node.recipeIngredient.map(String).map((item) => decodeHtmlEntities(item.trim())).filter(Boolean)
        : [];
      const steps = instructionLines(node.recipeInstructions);
      const rawYield = Array.isArray(node.recipeYield) ? node.recipeYield[0] : node.recipeYield;
      return {
        title: typeof node.name === "string" ? decodeHtmlEntities(node.name.trim()) || null : null,
        description: typeof node.description === "string" ? decodeHtmlEntities(node.description.trim()) || null : null,
        servings: rawYield === undefined || rawYield === null ? null : decodeHtmlEntities(String(rawYield).trim()) || null,
        imageUrl: imageUrl(node.image),
        ingredients,
        instructions: steps.length ? steps.map((step, index) => `${index + 1}. ${step}`).join("\n\n") : null,
      };
    } catch {
      // A page may contain multiple JSON-LD blocks; keep looking when one is malformed.
    }
  }
  return null;
}

function isPrivateAddress(address: string): boolean {
  if (address === "::1" || address === "0.0.0.0") return true;
  if (address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:")) return true;
  const parts = address.split(".").map(Number);
  if (parts.length !== 4) return false;
  return parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168);
}

async function assertPublicUrl(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Unsupported recipe URL");
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) throw new Error("Private recipe URL");
  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error("Private recipe URL");
  } else {
    const addresses = await lookup(hostname, { all: true });
    if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("Private recipe URL");
  }
  return url;
}

async function readLimitedHtml(response: Response): Promise<string> {
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_HTML_BYTES) throw new Error("Recipe page is too large");
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let html = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new Error("Recipe page is too large");
    }
    html += decoder.decode(value, { stream: true });
  }
  return html + decoder.decode();
}

export async function importRecipeFromUrl(rawUrl: string): Promise<ImportedRecipe | null> {
  try {
    let url = await assertPublicUrl(rawUrl);
    for (let redirects = 0; redirects <= 3; redirects++) {
      const response = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": "OurTableRecipeImporter/1.0" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location || redirects === 3) return null;
        url = await assertPublicUrl(new URL(location, url).toString());
        continue;
      }
      if (!response.ok || !response.headers.get("content-type")?.toLowerCase().includes("text/html")) return null;
      return extractRecipeFromHtml(await readLimitedHtml(response));
    }
  } catch {
    return null;
  }
  return null;
}
