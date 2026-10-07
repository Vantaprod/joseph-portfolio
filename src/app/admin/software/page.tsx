import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SoftwareList } from "@/components/admin/SoftwareList";

export const dynamic = "force-dynamic";

export default async function AdminSoftwarePage() {
  const items = await prisma.softwareProject.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="p-4 md:p-8 w-full overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-base">
              Software &amp; AI
            </h1>
            <p className="text-muted text-sm mt-1">
              Websites, apps, AI models &amp; hardware builds ({items.length})
            </p>
          </div>
          <Link
            href="/admin/software/new"
            prefetch={true}
            className="bg-primary text-white font-semibold px-5 py-2.5 rounded-full text-sm"
          >
            + New Entry
          </Link>
        </div>

        <SoftwareList initialItems={items} />
      </div>
    </div>
  );
}