"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type Item = {
  id: string;
  title: string;
  slug: string;
  type: string;
  featured: boolean;
  published: boolean;
  order: number;
  url: string | null;
  repoUrl: string | null;
};

export function SoftwareList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [toDelete, setToDelete] = useState<Item | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(toDelete.id);
    const res = await fetch("/api/admin/software/" + toDelete.id, {
      method: "DELETE",
    });
    if (res.ok) setItems((prev) => prev.filter((p) => p.id !== toDelete.id));
    setBusy(null);
    setToDelete(null);
  }

  async function toggle(item: Item, field: "published" | "featured") {
    const updated = { ...item, [field]: !item[field] };
    setBusy(item.id);
    setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)));
    await fetch("/api/admin/software/" + item.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setBusy(null);
  }

  if (items.length === 0) {
    return (
      <div className="bg-surface border border-base rounded-2xl p-12 text-center">
        <p className="text-muted text-base mb-3">No software projects yet.</p>
        <Link
          href="/admin/software/new"
          prefetch={true}
          className="text-primary text-sm"
        >
          Create your first one
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-surface border border-base rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-primary mb-1">
                  {item.type}
                </p>
                <h3 className="font-semibold text-base truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-muted truncate">{item.slug}</p>
              </div>
              <span className="text-xs text-muted flex-shrink-0">
                #{item.order}
              </span>
            </div>

            {(item.url || item.repoUrl) && (
              <div className="flex gap-3 text-xs mb-4">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary hover:underline"
                  >
                    Live ↗
                  </a>
                )}
                {item.repoUrl && (
                  <a
                    href={item.repoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-muted hover:text-primary"
                  >
                    Repo ↗
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(item, "published")}
                  disabled={busy === item.id}
                  className={
                    "text-xs px-2.5 py-1 rounded-full border " +
                    (item.published
                      ? "border-green-500/40 text-green-400"
                      : "border-base text-muted")
                  }
                >
                  {item.published ? "Live" : "Hidden"}
                </button>
                <button
                  onClick={() => toggle(item, "featured")}
                  disabled={busy === item.id}
                  className={
                    "text-xs px-2.5 py-1 rounded-full border " +
                    (item.featured
                      ? "border-[var(--color-primary)] text-primary"
                      : "border-base text-muted")
                  }
                >
                  {item.featured ? "Featured" : "Normal"}
                </button>
              </div>
              <div className="flex gap-3 text-sm">
                <Link
                  href={"/admin/software/" + item.id}
                  prefetch={true}
                  className="text-primary hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setToDelete(item)}
                  disabled={busy === item.id}
                  className="text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete entry?"
        message={'"' + (toDelete?.title ?? "") + '" will be permanently removed.'}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}