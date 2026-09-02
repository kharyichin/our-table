import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";
import { TELEGRAM_MEDIA_BUCKET } from "@/lib/telegram/media";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const householdId = path[0];
  if (!householdId || path.length < 4) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
  const objectPath = path.join("/");
  const { data, error } = await service.storage.from(TELEGRAM_MEDIA_BUCKET).download(objectPath);
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
