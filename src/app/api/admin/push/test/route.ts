import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/revalidate";
import { sendPushToAdmins } from "@/lib/push";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  if (!(await requireAdmin())) {
    revalidatePublic();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendPushToAdmins({
    title: "Test Notification",
    body: "If you see this, push notifications are working!",
    url: "/admin/messages",
    tag: "test",
  });

  revalidatePublic();

  return NextResponse.json(result);
}