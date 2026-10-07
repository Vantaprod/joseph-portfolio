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

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.softwareProject.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const p = schema.safeParse(await req.json());
    if (!p.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    let slug = slugify(p.data.title);
    const dup = await prisma.softwareProject.findUnique({ where: { slug } });
    if (dup) slug = slug + "-" + Date.now().toString(36);

    const item = await prisma.softwareProject.create({
      data: {
        ...p.data,
        slug,
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
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}