import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/revalidate";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";



export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let s = await prisma.siteSettings.findFirst();
  if (!s) s = await prisma.siteSettings.create({ data: {} });
  revalidatePublic();
  return NextResponse.json(s);
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    let s = await prisma.siteSettings.findFirst();
    if (!s) {
      s = await prisma.siteSettings.create({ data: body });
    } else {
      s = await prisma.siteSettings.update({ where: { id: s.id }, data: body });
    }
    revalidatePublic();
    return NextResponse.json(s);
  } catch (err) {
    console.error(err);
    revalidatePublic();
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}