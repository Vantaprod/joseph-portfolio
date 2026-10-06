import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/revalidate";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    revalidatePublic();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    revalidatePublic();
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  revalidatePublic();
  return NextResponse.json(project);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    revalidatePublic();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const b = await req.json();

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: b.title,
        description: b.description,
        category: b.category,
        client: b.client || null,
        year: b.year ? Number(b.year) : null,
        role: b.role || null,
        thumbnail: b.thumbnail || null,
        videoUrl: b.videoUrl || null,
        gallery: b.gallery || null,
        featured: !!b.featured,
        published: b.published !== false,
        order: Number(b.order) || 0,
      },
    });
    revalidatePublic();
    return NextResponse.json(project);
  } catch (err) {
    console.error("Project update error:", err);
    revalidatePublic();
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    revalidatePublic();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePublic();
    return NextResponse.json({ ok: true });
  } catch {
    revalidatePublic();
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}