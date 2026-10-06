import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/revalidate";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";



export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  revalidatePublic();
  return NextResponse.json(messages);
}