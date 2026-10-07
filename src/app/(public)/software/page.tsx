import { prisma } from "@/lib/prisma";
import { SoftwareCard } from "@/components/public/SoftwareCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Software & AI — Joseph Chimaobi Egbuonu",
  description: "Websites, apps, AI models and hardware builds.",
};

export default async function SoftwarePage() {
  const items = await prisma.softwareProject.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  const types = Array.from(new Set(items.map((i) => i.type)));

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
        Software &amp; AI
      </p>
      <h1 className="text-4xl md:text-7xl font-bold text-base leading-[0.95] mb-6">
        Things I Build
      </h1>
      <p className="text-muted text-sm md:text-base max-w-2xl mb-12">
        A collection of websites, apps, AI models, and hardware builds
        I&apos;ve engineered.
      </p>

      {items.length === 0 ? (
        <p className="text-muted">No projects yet.</p>
      ) : (
        <>
          {types.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {["All", ...types].map((t) => (
                <span
                  key={t}
                  className="text-xs uppercase tracking-widest px-4 py-2 rounded-full border border-base text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <SoftwareCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}