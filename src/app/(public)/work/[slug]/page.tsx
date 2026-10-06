import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} — Joseph Chimaobi Egbuonu`,
    description: project.description.slice(0, 160),
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project || !project.published) notFound();

  const allProjects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    select: { slug: true, title: true },
  });

  const index = allProjects.findIndex((p) => p.slug === project.slug);
  const prev = index > 0 ? allProjects[index - 1] : null;
  const next =
    index < allProjects.length - 1 ? allProjects[index + 1] : null;

  let gallery: string[] = [];
  try {
    gallery = project.gallery ? JSON.parse(project.gallery) : [];
  } catch {
    gallery = [];
  }

  return (
    <article className="w-full max-w-6xl mx-auto px-6 lg:px-8 py-12 md:py-20">
      <Link
        href="/work"
        prefetch={true}
        className="text-sm text-muted hover:text-primary transition-colors"
      >
        ← Back to Work
      </Link>

      <header className="mt-8 mb-8 md:mb-12">
        <div className="flex items-center gap-3 text-xs text-muted uppercase tracking-widest mb-4">
          <span className="text-primary">{project.category}</span>
          {project.year && <span>· {project.year}</span>}
        </div>
        <h1 className="text-3xl md:text-6xl font-bold text-base leading-tight">
          {project.title}
        </h1>
      </header>

      {/* Hero media — respects native aspect ratio, no crop, no letterbox */}
      {project.videoUrl ? (
        <div className="bg-black rounded-2xl overflow-hidden mb-8 md:mb-12 flex items-center justify-center">
          <video
            src={project.videoUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      ) : project.thumbnail ? (
        <div className="bg-black rounded-2xl overflow-hidden mb-8 md:mb-12 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      ) : (
        <div className="aspect-video bg-surface border border-base rounded-2xl flex items-center justify-center mb-8 md:mb-12">
          <span className="text-muted">No media available</span>
        </div>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16">
        <div className="md:col-span-2">
          <h2 className="text-xs uppercase tracking-widest text-primary mb-4">
            About this project
          </h2>
          <p className="text-base leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>

        <aside className="space-y-6">
          {project.client && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-1">
                Client
              </p>
              <p className="text-base">{project.client}</p>
            </div>
          )}
          {project.role && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-1">
                Role
              </p>
              <p className="text-base">{project.role}</p>
            </div>
          )}
          {project.year && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-1">
                Year
              </p>
              <p className="text-base">{project.year}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-1">
              Category
            </p>
            <p className="text-base">{project.category}</p>
          </div>
        </aside>
      </div>

      {/* Gallery — also respects native aspect ratio */}
      {gallery.length > 0 && (
        <section className="mb-12 md:mb-16">
          <h2 className="text-xs uppercase tracking-widest text-primary mb-6">
            Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gallery.map((src, i) => (
              <div
                key={i}
                className="bg-black border border-base rounded-xl overflow-hidden flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${project.title} — ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prev / Next */}
      <nav className="border-t border-base pt-8 flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/work/${prev.slug}`}
            prefetch={true}
            className="group text-left max-w-[45%]"
          >
            <p className="text-xs uppercase tracking-widest text-muted mb-1">
              ← Previous
            </p>
            <p className="text-base group-hover:text-primary transition-colors">
              {prev.title}
            </p>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/work/${next.slug}`}
            prefetch={true}
            className="group text-right max-w-[45%] ml-auto"
          >
            <p className="text-xs uppercase tracking-widest text-muted mb-1">
              Next →
            </p>
            <p className="text-base group-hover:text-primary transition-colors">
              {next.title}
            </p>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}