import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectsList } from "@/components/admin/ProjectsList";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      featured: true,
      published: true,
      order: true,
      year: true,
    },
  });

  return (
    <div className="p-4 md:p-8 w-full overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-base">
              Projects
            </h1>
            <p className="text-muted text-sm mt-1">
              Manage your portfolio work ({projects.length} total)
            </p>
          </div>
          <Link
            href="/admin/projects/new"
            prefetch={true}
            className="inline-flex items-center justify-center bg-primary text-white font-semibold px-5 py-2.5 rounded-full text-sm self-start sm:self-auto"
          >
            + New Project
          </Link>
        </div>

        <ProjectsList initialProjects={projects} />
      </div>
    </div>
  );
}