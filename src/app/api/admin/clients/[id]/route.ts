import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/revalidate";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().url(),
  website: z.string().optional().default(""),
  order: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const p = schema.safeParse(await req.json());
    if (!p.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    const item = await prisma.clientLogo.update({
      where: { id },
      data: {
        name: p.data.name,
        logoUrl: p.data.logoUrl,
        website: p.data.website || null,
        order: p.data.order,
        published: p.data.published,
      },
    });
    revalidatePublic();
    return NextResponse.json(item);
  } catch (err) {
    console.error(err);
    revalidatePublic();
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.clientLogo.delete({ where: { id } });
    revalidatePublic();
    return NextResponse.json({ ok: true });
  } catch {
    revalidatePublic();
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}