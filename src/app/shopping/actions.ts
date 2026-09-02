"use server";

import { revalidatePath } from "next/cache";
import { updateShoppingItem, regenerateShoppingList, addManualShoppingItem } from "@/lib/data/shoppingLists";
import { createGroceryFind, deleteGroceryFind, type GroceryFindInput } from "@/lib/data/groceryFinds";
import { getDemoHouseholdId } from "@/lib/data/household";

export async function toggleCheckedAction(itemId: string, checked: boolean) {
  await updateShoppingItem(itemId, { checked });
  revalidatePath("/shopping");
  revalidatePath("/finds");
}

export async function toggleHaveItAction(itemId: string, haveIt: boolean) {
  await updateShoppingItem(itemId, { haveIt });
  revalidatePath("/shopping");
}

export async function setItemStoreAction(itemId: string, store: string | null) {
  await updateShoppingItem(itemId, { store });
  revalidatePath("/shopping");
}

export async function setItemSubstitutionAction(itemId: string, substitution: string) {
  await updateShoppingItem(itemId, { substitution: substitution || null });
  revalidatePath("/shopping");
}

export async function refreshShoppingListAction(planId: string) {
  await regenerateShoppingList(planId);
  revalidatePath("/shopping");
}

export async function addManualShoppingItemAction(planId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Item name is required");
  await addManualShoppingItem(planId, {
    name,
    quantity: String(formData.get("quantity") ?? "").trim() || null,
    store: String(formData.get("store") ?? "").trim() || null,
  });
  revalidatePath("/shopping");
}

export async function createGroceryFindAction(formData: FormData) {
  const householdId = await getDemoHouseholdId();
  const input: GroceryFindInput = {
    store: String(formData.get("store") ?? "").trim(),
    ingredient: String(formData.get("ingredient") ?? "").trim(),
    price: formData.get("price") ? Number(formData.get("price")) : null,
    description: (formData.get("description") as string) || null,
    sourceUrl: (formData.get("sourceUrl") as string) || null,
    expiryDate: (formData.get("expiryDate") as string) || null,
    relatedRecipeIds: formData.getAll("relatedRecipeIds").map(String),
  };
  if (!input.store || !input.ingredient) throw new Error("Store and ingredient are required");
  await createGroceryFind(householdId, input);
  revalidatePath("/shopping");
  revalidatePath("/week");
  revalidatePath("/home");
  revalidatePath("/finds");
}

export async function deleteGroceryFindAction(id: string) {
  await deleteGroceryFind(id);
  revalidatePath("/shopping");
  revalidatePath("/week");
  revalidatePath("/finds");
}
