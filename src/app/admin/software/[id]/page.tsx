import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SoftwareForm } from "@/components/admin/SoftwareForm";

export default async function EditSoftwarePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.softwareProject.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-base mb-8">Edit Entry</h1>
      <SoftwareForm
        initial={{
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
          techStack: item.techStack ?? "",
          url: item.url ?? "",
          repoUrl: item.repoUrl ?? "",
          thumbnail: item.thumbnail ?? "",
          gallery: item.gallery ?? "",
          featured: item.featured,
          published: item.published,
          order: item.order,
        }}
      />
    </div>
  );
}