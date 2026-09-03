import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";

const MEMORY_PHOTOS_BUCKET = "memory-photos";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const householdId = path[0];
  if (!householdId || path.length < 2) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: membership } = await supabase!
    .from("household_members")
    .select("id")
    .eq("household_id", householdId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const service = getSupabaseServiceClient();
  if (!service) return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });
  const { data, error } = await service.storage.from(MEMORY_PHOTOS_BUCKET).download(path.join("/"));
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
