import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePublic } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  type: z.string().min(2),
  techStack: z.string().optional().default(""),
  url: z.string().optional().default(""),
  repoUrl: z.string().optional().default(""),
  thumbnail: z.string().optional().default(""),
  gallery: z.string().optional().default(""),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const p = schema.safeParse(await req.json());
    if (!p.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    const item = await prisma.softwareProject.update({
      where: { id },
      data: {
        ...p.data,
        techStack: p.data.techStack || null,
        url: p.data.url || null,
        repoUrl: p.data.repoUrl || null,
        thumbnail: p.data.thumbnail || null,
        gallery: p.data.gallery || null,
      },
    });
    revalidatePublic();
    return NextResponse.json(item);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.softwareProject.delete({ where: { id } });
    revalidatePublic();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}