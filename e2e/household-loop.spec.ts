import { expect, test } from "@playwright/test";

const RECIPE_TITLE = "Test Kitchen Noodles";
const MEMORY_NOTE = "The carrots stayed crisp and everyone asked for seconds.";

test("capture → review → plan → shop → cook → memory → archive", async ({ page }) => {
  await page.goto("/ideas");
  await expect(page.getByRole("heading", { name: "Idea Garden" })).toBeVisible();

  await page.getByRole("button", { name: "Try a capture" }).click();
  await page.getByLabel("Message").fill("mystery noodles");
  await page.getByRole("button", { name: "Capture message" }).click();
  await expect(page.getByRole("heading", { name: "Added to the capture inbox" })).toBeVisible();
  await page.getByRole("button", { name: "Back to the garden" }).click();

  await expect(page.getByRole("heading", { name: "Telegram inbox" })).toBeVisible();
  await page.getByRole("button", { name: "Review details" }).click();
  await page.getByLabel("Title or item name").fill(RECIPE_TITLE);
  await page.getByLabel("Cuisine tags").fill("japanese");
  await page.getByLabel("Ingredient tags").fill("noodles, carrots");
  await page.getByRole("button", { name: "It's a recipe" }).click();
  const capturedRecipe = page.getByRole("link", { name: new RegExp(RECIPE_TITLE) });
  await expect(capturedRecipe).toBeVisible();
  await capturedRecipe.click();
  await expect(page.getByRole("heading", { name: RECIPE_TITLE, level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Ingredients (one per line)").fill("2 carrots\n1 package noodles");
  await page.getByLabel("Instructions").fill("Boil the noodles, then toss with the carrots.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "2 carrots" })).toBeVisible();

  await page.getByRole("button", { name: "Add to this week" }).click();
  await page.getByRole("button", { name: "Monday", exact: true }).click();
  await page.getByRole("button", { name: "Plan for Monday" }).click();
  await expect(page).toHaveURL(/\/week/);
  await expect(page.getByRole("link", { name: RECIPE_TITLE, exact: true })).toBeVisible();

  const mondayCard = page.locator(".paper-card").filter({ hasText: "Monday" }).filter({ hasText: RECIPE_TITLE }).first();
  await mondayCard.getByRole("button", { name: "Cooked" }).click();
  await expect(mondayCard.getByRole("button", { name: "Add the memory" })).toBeVisible();
  await mondayCard.getByRole("button", { name: "Add the memory" }).click();
  await page.getByLabel("The memory").fill(MEMORY_NOTE);
  await page.getByLabel("Changes made").fill("Added extra carrots");
  await page.getByRole("button", { name: "Save memory" }).click();
  await expect(page.getByRole("heading", { name: new RegExp(`Remember ${RECIPE_TITLE}`) })).toBeHidden();

  await page.goto("/shopping");
  await page.getByRole("button", { name: /Refresh from plan/ }).click();
  await expect(page.getByRole("checkbox", { name: /^carrots ·/i })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /noodles · 1 package/i })).toBeVisible();
  await expect(page.getByText(`Mon · ${RECIPE_TITLE}`, { exact: true })).toHaveCount(2);

  await page.goto("/memories");
  await expect(page.getByRole("heading", { name: "Memory Book" })).toBeVisible();
  await expect(page.getByText(MEMORY_NOTE)).toBeVisible();
  await expect(page.getByRole("link", { name: RECIPE_TITLE })).toBeVisible();
});
