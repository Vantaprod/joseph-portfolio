import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/revalidate";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdmin())) {
    revalidatePublic();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    totalViews,
    todayViews,
    weekViews,
    topProjects,
    topPages,
    recentViews,
  ] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.pageView.groupBy({
      by: ["projectId"],
      where: { projectId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { projectId: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Fetch project titles for top projects
  const projectIds = topProjects
    .map((p) => p.projectId)
    .filter((id): id is string => !!id);
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, title: true, slug: true },
  });

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const projectsWithCounts = topProjects
    .filter((p) => p.projectId && projectMap.has(p.projectId))
    .map((p) => {
      const project = projectMap.get(p.projectId!);
      return {
        id: p.projectId!,
        title: project?.title ?? "Unknown",
        slug: project?.slug ?? "",
        views: p._count._all,
      };
    });

  // Build last 14 days data
  const days: { date: string; views: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    d.setHours(0, 0, 0, 0);
    days.push({
      date: d.toISOString().slice(0, 10),
      views: 0,
    });
  }
  for (const v of recentViews) {
    const key = new Date(v.createdAt).toISOString().slice(0, 10);
    const day = days.find((d) => d.date === key);
    if (day) day.views++;
  }

  revalidatePublic();

  return NextResponse.json({
    totals: {
      allTime: totalViews,
      today: todayViews,
      week: weekViews,
    },
    topProjects: projectsWithCounts,
    topPages: topPages.map((p) => ({
      path: p.path,
      views: p._count._all,
    })),
    days,
  });
}