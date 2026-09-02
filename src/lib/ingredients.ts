export interface ParsedIngredient {
  name: string;
  quantity: string | null;
  key: string;
}

const FRACTIONS: Record<string, string> = {
  "¼": "1/4",
  "½": "1/2",
  "¾": "3/4",
  "⅓": "1/3",
  "⅔": "2/3",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
};

const UNIT_ALIASES: Record<string, string> = {
  c: "cup",
  cup: "cup",
  cups: "cup",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  ml: "ml",
  l: "l",
  can: "can",
  cans: "can",
  bunch: "bunch",
  bunches: "bunch",
  bag: "bag",
  bags: "bag",
  box: "box",
  boxes: "box",
  package: "package",
  packages: "package",
  pack: "package",
  packs: "package",
  clove: "clove",
  cloves: "clove",
  piece: "piece",
  pieces: "piece",
};

function replaceUnicodeFractions(value: string): string {
  return value.replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, (fraction) => ` ${FRACTIONS[fraction]} `).replace(/\s+/g, " ").trim();
}

function singularizeWord(word: string): string {
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("oes") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) return word.slice(0, -1);
  return word;
}

export function normalizeIngredientKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\b(fresh|frozen|large|small|medium|boneless|skinless|steamed|cooked|day-old|chopped|diced|minced|sliced|grated|optional)\b/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singularizeWord)
    .join(" ")
    .trim();
}

export function parseIngredientLine(raw: string): ParsedIngredient | null {
  const line = replaceUnicodeFractions(raw.replace(/^[-*•]\s*/, "").trim());
  if (!line) return null;

  const match = line.match(/^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+|handful|pinch)(?:\s+([a-zA-Z]+))?\s+(.+)$/i);
  if (!match) return { name: line, quantity: null, key: normalizeIngredientKey(line) };

  const [, amount, rawUnit, remainder] = match;
  const wordAmount = /^(handful|pinch)$/i.test(amount);
  const unit = rawUnit && !wordAmount ? UNIT_ALIASES[rawUnit.toLowerCase()] : undefined;
  // If the word after the amount is not a known unit, it belongs to the name
  // (for example, "2 chicken thighs").
  const name = unit ? remainder.trim() : `${rawUnit ?? ""} ${remainder}`.trim();
  const quantity = unit ? `${amount} ${unit}` : amount.toLowerCase();
  return { name, quantity, key: normalizeIngredientKey(name) };
}

function numberFromAmount(value: string): number | null {
  const parts = value.split(" ");
  let total = 0;
  for (const part of parts) {
    if (part.includes("/")) {
      const [numerator, denominator] = part.split("/").map(Number);
      if (!denominator) return null;
      total += numerator / denominator;
    } else {
      const parsed = Number(part);
      if (!Number.isFinite(parsed)) return null;
      total += parsed;
    }
  }
  return total;
}

function formatAmount(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

export function mergeIngredientQuantities(current: string | null, incoming: string | null): string | null {
  if (!current) return incoming;
  if (!incoming || current === incoming) return current;

  const pattern = /^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)(?:\s+(.+))?$/;
  const left = current.match(pattern);
  const right = incoming.match(pattern);
  if (left && right && (left[2] ?? "") === (right[2] ?? "")) {
    const leftAmount = numberFromAmount(left[1]);
    const rightAmount = numberFromAmount(right[1]);
    if (leftAmount !== null && rightAmount !== null) {
      return `${formatAmount(leftAmount + rightAmount)}${left[2] ? ` ${left[2]}` : ""}`;
    }
  }

  const parts = new Set([...current.split(" + "), ...incoming.split(" + ")]);
  return Array.from(parts).join(" + ");
}
