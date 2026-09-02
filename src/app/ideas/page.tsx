import { getDemoHouseholdId, getHouseholdMembers } from "@/lib/data/household";
import { listRecipes } from "@/lib/data/recipes";
import { listNeedsReviewCaptures } from "@/lib/data/captures";
import { IdeaGardenClient } from "@/components/ideas/IdeaGardenClient";
import { CaptureInbox } from "@/components/ideas/CaptureInbox";
import { MockCapture } from "@/components/ideas/MockCapture";

export default async function IdeasPage() {
  const householdId = await getDemoHouseholdId();
  const [recipes, members, captures] = await Promise.all([
    listRecipes(householdId),
    getHouseholdMembers(householdId),
    listNeedsReviewCaptures(householdId),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-10 lg:py-12">
      <div className="chapter-masthead mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chapter-kicker">Saved from the household chat</p>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Idea Garden</h1>
          <p className="mt-2 text-sm text-ink-soft">Recipes begin as scraps of conversation, then grow into weeks and memories.</p>
        </div>
        <MockCapture />
      </div>

      <CaptureInbox captures={captures} />

      <IdeaGardenClient
        recipes={recipes}
        members={members.map((m) => ({ id: m.profileId, name: m.profile?.displayName ?? "Someone" }))}
      />
    </div>
  );
}
