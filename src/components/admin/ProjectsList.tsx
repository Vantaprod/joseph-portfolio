"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  featured: boolean;
  published: boolean;
  order: number;
  year: number | null;
};

export function ProjectsList({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(toDelete.id);
    try {
      const res = await fetch(`/api/admin/projects/${toDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Delete failed. Refresh and try again.");
      } else {
        setProjects((prev) => prev.filter((p) => p.id !== toDelete.id));
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
      setToDelete(null);
    }
  }

  async function toggleField(p: Project, field: "published" | "featured") {
    const updated = { ...p, [field]: !p[field] };
    setBusy(p.id);
    setProjects((prev) => prev.map((x) => (x.id === p.id ? updated : x)));

    try {
      const res = await fetch(`/api/admin/projects/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        // Revert on failure
        setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
        setError("Update failed.");
      }
    } catch {
      setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="bg-surface border border-base rounded-2xl p-8 md:p-12 text-center">
        <p className="text-muted text-sm md:text-base">No projects yet.</p>
        <Link
          href="/admin/projects/new"
          prefetch={true}
          className="text-primary text-sm mt-3 inline-block"
        >
          Create your first project
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-2.5">
          {error}
        </div>
      )}

      <div className="bg-surface border border-base rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-base text-left text-xs uppercase tracking-widest text-muted">
                <th className="px-3 md:px-5 py-3 md:py-4">Title</th>
                <th className="px-3 md:px-5 py-3 md:py-4">Category</th>
                <th className="px-3 md:px-5 py-3 md:py-4">Year</th>
                <th className="px-3 md:px-5 py-3 md:py-4">Order</th>
                <th className="px-3 md:px-5 py-3 md:py-4">Status</th>
                <th className="px-3 md:px-5 py-3 md:py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-base last:border-0 hover:bg-base/40"
                >
                  <td className="px-3 md:px-5 py-3 md:py-4">
                    <p className="font-medium text-base text-sm md:text-base truncate max-w-[180px] md:max-w-none">
                      {p.title}
                    </p>
                    <p className="text-xs text-muted truncate max-w-[180px] md:max-w-none">
                      {p.slug}
                    </p>
                  </td>
                  <td className="px-3 md:px-5 py-3 md:py-4 text-xs md:text-sm text-muted">
                    {p.category}
                  </td>
                  <td className="px-3 md:px-5 py-3 md:py-4 text-xs md:text-sm text-muted">
                    {p.year ?? "-"}
                  </td>
                  <td className="px-3 md:px-5 py-3 md:py-4 text-xs md:text-sm text-muted">
                    {p.order}
                  </td>
                  <td className="px-3 md:px-5 py-3 md:py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => toggleField(p, "published")}
                        disabled={busy === p.id}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          p.published
                            ? "border-green-500/40 text-green-400"
                            : "border-base text-muted"
                        } disabled:opacity-50`}
                      >
                        {p.published ? "Published" : "Draft"}
                      </button>
                      <button
                        onClick={() => toggleField(p, "featured")}
                        disabled={busy === p.id}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          p.featured
                            ? "border-[var(--color-primary)] text-primary"
                            : "border-base text-muted"
                        } disabled:opacity-50`}
                      >
                        {p.featured ? "Featured" : "Normal"}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 md:px-5 py-3 md:py-4 text-right">
                    <div className="inline-flex gap-3 text-xs md:text-sm">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        prefetch={true}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setToDelete(p)}
                        disabled={busy === p.id}
                        className="text-red-400 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete project?"
        message={`"${toDelete?.title}" will be permanently removed.`}
        confirmLabel="Delete Project"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}