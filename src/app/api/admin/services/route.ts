import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/revalidate";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";



const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  icon: z.string().optional().default(""),
  order: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  revalidatePublic();
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const p = schema.safeParse(await req.json());
    if (!p.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    const service = await prisma.service.create({
      data: { ...p.data, icon: p.data.icon || null },
    });
    revalidatePublic();
    return NextResponse.json(service);
  } catch {
    revalidatePublic();
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}