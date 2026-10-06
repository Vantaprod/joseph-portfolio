import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/revalidate";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";



export async function GET() {
  if (!(await requireAdmin()))
    revalidatePublic();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  revalidatePublic();
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    revalidatePublic();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  const slug = b.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const dup = await prisma.project.findUnique({ where: { slug } });
  const finalSlug = dup ? slug + "-" + Date.now().toString(36) : slug;

  const project = await prisma.project.create({
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
      slug: finalSlug,
    },
  });
  revalidatePublic();
  return NextResponse.json(project);
}