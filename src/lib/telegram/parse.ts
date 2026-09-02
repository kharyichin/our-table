import { GROCERY_STORES } from "@/lib/types";

const URL_RE = /https?:\/\/[^\s]+/gi;
const HASHTAG_RE = /#([a-z0-9_]+)/gi;
const PRICE_RE = /\$\s?(\d+(?:\.\d{1,2})?)/;

const RECIPE_LEAD_INS = [
  /^want to try\s+(this\s+)?/i,
  /^want to make\s+(this\s+)?/i,
  /^let'?s try\s+(this\s+)?/i,
  /^thinking about making\s+(this\s+)?/i,
  /^found this\s+/i,
  /^check out (this\s+)?/i,
  /^we should try\s+(this\s+)?/i,
  /^gonna try\s+(this\s+)?/i,
];
const TRAILING_NOISE = [
  /\bnext week\b\.?/i,
  /\bthis weekend\b\.?/i,
  /\btonight\b\.?/i,
  /\bsometime\b\.?/i,
  /\bsoon\b\.?/i,
];
const GROCERY_SIGNAL_WORDS = /\b(deal|sale|off|clearance|marked down|discount|bogo|coupon)\b/i;
const GROCERY_FILLER = [
  /\bgreat deal on\b/gi,
  /\bgood deal on\b/gi,
  /\bdeal on\b/gi,
  /\bmarked down\b/gi,
  /\bon sale\b/gi,
  /\bclearance\b/gi,
  /\bdiscount(ed)?\b/gi,
];
const SMALL_WORDS = new Set(["a", "an", "the", "of", "and", "or", "in", "on", "with", "to", "for"]);

const CUISINE_TAGS = new Set([
  "american", "cajun", "chinese", "ethiopian", "filipino", "french", "greek", "indian",
  "italian", "japanese", "korean", "mediterranean", "mexican", "middleeastern", "moroccan",
  "spanish", "thai", "turkish", "vietnamese",
]);
const NON_RECIPE_TAGS = new Set(["deal", "sale", "clearance", "bogo", "coupon", "safeway", "99ranch", "target", "traderjoes"]);

export function extractUrls(text: string): string[] {
  return Array.from(new Set(text.match(URL_RE) ?? []));
}

export function extractHashtags(text: string): string[] {
  const tags: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(HASHTAG_RE);
  while ((match = re.exec(text))) tags.push(match[1].toLowerCase());
  return Array.from(new Set(tags));
}

export function splitRecipeHashtags(hashtags: string[]): { cuisineTags: string[]; ingredientTags: string[] } {
  const usable = hashtags.map((tag) => tag.toLowerCase()).filter((tag) => !NON_RECIPE_TAGS.has(tag));
  return {
    cuisineTags: usable.filter((tag) => CUISINE_TAGS.has(tag)),
    ingredientTags: usable.filter((tag) => !CUISINE_TAGS.has(tag)),
  };
}

function stripUrlsAndTags(text: string): string {
  return text.replace(URL_RE, "").replace(HASHTAG_RE, "").replace(/\s+/g, " ").trim();
}

function toTitleCase(text: string): string {
  return text
    .split(" ")
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function cleanPhrase(text: string): string {
  let cleaned = text;
  for (const re of RECIPE_LEAD_INS) cleaned = cleaned.replace(re, "");
  for (const re of TRAILING_NOISE) cleaned = cleaned.replace(re, "");
  cleaned = cleaned.replace(/[.!\s]+$/, "").trim();
  return cleaned;
}

function findStore(text: string): string | null {
  const lower = text.toLowerCase();
  for (const store of GROCERY_STORES) {
    if (lower.includes(store.toLowerCase())) return store;
  }
  return null;
}

function cleanGroceryPhrase(text: string, store: string | null): string {
  let cleaned = text.replace(PRICE_RE, "");
  for (const re of GROCERY_FILLER) cleaned = cleaned.replace(re, "");
  if (store) cleaned = cleaned.replace(new RegExp(`\\bat\\s+${store}\\b`, "i"), "").replace(new RegExp(store, "i"), "");
  // Drop unit/price fragments left behind, e.g. ", /lb" or trailing commas.
  cleaned = cleaned
    .replace(/\/\s?(lb|oz|each|ea)\b/gi, "")
    .replace(/[,\s]+$/g, "")
    .replace(/^[,\s]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleanPhrase(cleaned);
}

export type CaptureClassification =
  | { kind: "recipe"; title: string; confidence: "high" | "medium" }
  | { kind: "grocery"; ingredient: string; store: string | null; price: number | null; confidence: "high" | "medium" }
  | { kind: "ambiguous" };

// Deterministic heuristic classifier — no ML, no external calls. Good enough
// to auto-draft the obvious cases; anything uncertain becomes an Inbox item
// (status: needs_review) for a human to sort out inside the app.
export function classifyCapture(rawText: string, hashtags: string[], urls: string[]): CaptureClassification {
  const text = rawText ?? "";
  const store = findStore(text);
  const priceMatch = text.match(PRICE_RE);
  const hasGrocerySignal = Boolean(store) || Boolean(priceMatch) || GROCERY_SIGNAL_WORDS.test(text);

  if (hasGrocerySignal) {
    const phrase = cleanGroceryPhrase(stripUrlsAndTags(text), store);
    const ingredient = phrase.length > 0 ? toTitleCase(phrase) : hashtags[0] ? toTitleCase(hashtags[0]) : "Grocery find";
    return {
      kind: "grocery",
      ingredient,
      store,
      price: priceMatch ? Number(priceMatch[1]) : null,
      confidence: store && priceMatch ? "high" : "medium",
    };
  }

  const phrase = cleanPhrase(stripUrlsAndTags(text));
  // Require either a real link, a hashtag, or genuinely multi-word text
  // before assuming free text is a recipe idea — a bare "lol" or "thanks"
  // shouldn't become a draft. Anything thinner than that goes to the inbox.
  const looksSubstantial = phrase.split(/\s+/).filter(Boolean).length >= 3;
  if (phrase.length >= 3 && (urls.length > 0 || hashtags.length > 0 || looksSubstantial)) {
    return { kind: "recipe", title: toTitleCase(phrase), confidence: urls.length > 0 ? "high" : "medium" };
  }

  // No usable free text, but a link plus a descriptive hashtag is still a
  // strong enough signal to draft a title from the tags themselves.
  if (hashtags.length > 0 && urls.length > 0) {
    return { kind: "recipe", title: toTitleCase(hashtags.join(" ")), confidence: "medium" };
  }

  return { kind: "ambiguous" };
}

export function buildMessageLink(chatId: number, messageId: number): string | null {
  // Public/supergroup deep links follow t.me/c/<internal_id>/<message_id>,
  // where internal_id drops the -100 prefix Telegram uses for supergroups.
  const idStr = String(chatId);
  if (idStr.startsWith("-100")) {
    return `https://t.me/c/${idStr.slice(4)}/${messageId}`;
  }
  return null;
}
