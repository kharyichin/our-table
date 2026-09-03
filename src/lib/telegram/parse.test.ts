import { describe, expect, it } from "vitest";
import { classifyCapture, extractHashtags, extractUrls, splitRecipeHashtags } from "@/lib/telegram/parse";

describe("Telegram capture parsing", () => {
  it("extracts unique normalized hashtags and URLs", () => {
    const text = "Try this #Chicken #japanese #chicken https://example.com/a";
    expect(extractHashtags(text)).toEqual(["chicken", "japanese"]);
    expect(extractUrls(text)).toEqual(["https://example.com/a"]);
  });

  it("separates cuisines from ingredients and removes workflow/store tags", () => {
    expect(splitRecipeHashtags(["Chicken", "japanese", "sale", "99ranch"])).toEqual({
      cuisineTags: ["japanese"],
      ingredientTags: ["chicken"],
    });
  });

  it("recognizes a merchant deal as a grocery find", () => {
    expect(classifyCapture("Chicken thighs $3.99 at Safeway #chicken", ["chicken"], [])).toMatchObject({
      kind: "grocery",
      store: "Safeway",
      price: 3.99,
      confidence: "high",
    });
  });

  it("keeps low-signal chatter in review", () => {
    expect(classifyCapture("thanks", [], [])).toEqual({ kind: "ambiguous" });
  });
});
